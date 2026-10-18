#!/usr/bin/env python3
"""Run Shannon against disposable Hyperlocal web/admin containers."""

from __future__ import annotations

import argparse
import base64
import datetime as dt
import hashlib
import hmac
import json
import os
from pathlib import Path
import secrets
import shutil
import sqlite3
import subprocess
import sys
import time
import urllib.error
import urllib.request


TOOL_DIR = Path(__file__).resolve().parent
REPO = TOOL_DIR.parent.parent
SCHEMA = REPO / "packages/db/schema.sql"
DEFAULT_RUNS = REPO / ".cache/security-audit"
PINNED_SHANNON = Path(os.environ.get("XDG_CACHE_HOME", str(Path.home() / ".cache"))) / "hyperlocal-security-audit/shannon-2468b67/shannon"
PORTS = {"web": 4174, "admin": 4176}


def call(
    args: list[str], *, cwd: Path | None = None, env: dict[str, str] | None = None,
    echo: bool = True, stream: bool = False,
) -> str:
    print("+", " ".join(args), flush=True)
    try:
        result = subprocess.run(args, cwd=cwd, env=env, check=True, text=True, capture_output=not stream)
    except subprocess.CalledProcessError as error:
        if not stream:
            for output in (error.stdout, error.stderr):
                if output:
                    print(output[-4000:].rstrip(), file=sys.stderr, flush=True)
        raise
    if echo and result.stdout:
        print(result.stdout.rstrip(), flush=True)
    if echo and result.stderr:
        print(result.stderr.rstrip(), file=sys.stderr, flush=True)
    return result.stdout or ""


def docker(*args: str, stream: bool = False) -> str:
    return call(["docker", *args], stream=stream)


def write_private(path: Path, data: str) -> None:
    path.write_text(data)
    path.chmod(0o600)


def check_source() -> str:
    if call(["git", "status", "--porcelain", "--untracked-files=normal"], cwd=REPO, echo=False).strip():
        raise RuntimeError("Commit or stash changes before scanning; the target must be an exact commit")
    tracked = call(["git", "ls-files"], cwd=REPO, echo=False).splitlines()
    for name in tracked:
        path = Path(name)
        if (path.name.startswith(".env") and not path.name.endswith(".example")) or path.name.startswith(".dev.vars"):
            raise RuntimeError(f"Refusing to copy tracked credential file: {name}")
        if path.suffix in {".pem", ".key"}:
            raise RuntimeError(f"Refusing to copy tracked key file: {name}")
        if path.parts[0] == "data" and path.name != ".gitkeep":
            raise RuntimeError(f"Refusing to copy tracked data file: {name}")
    return call(["git", "rev-parse", "HEAD"], cwd=REPO, echo=False).strip()


def make_cookie(token: str, secret: str) -> str:
    signature = base64.b64encode(hmac.new(secret.encode(), token.encode(), hashlib.sha256).digest()).decode()
    return f"better-auth.session_token={token}.{signature}"


def seed_database(path: Path, tokens: dict[str, str]) -> None:
    conn = sqlite3.connect(path)
    try:
        conn.executescript(SCHEMA.read_text())
        now = dt.datetime.now(dt.timezone.utc)
        created = now.isoformat()
        expires = (now + dt.timedelta(days=2)).isoformat()
        for role in ("admin", "user"):
            uid = f"audit-{role}"
            conn.execute(
                'INSERT INTO "user" (id, name, email, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
                (uid, f"Audit {role}", f"{uid}@example.test", role, created, created),
            )
            conn.execute(
                'INSERT INTO "session" (id, user_id, token, expires_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
                (secrets.token_urlsafe(18), uid, tokens[role], expires, created, created),
            )
        conn.commit()
    finally:
        conn.close()
    path.chmod(0o600)


def env_file(path: Path, values: dict[str, str]) -> None:
    if any("\n" in value or "\r" in value for value in values.values()):
        raise RuntimeError("Newlines are not allowed in Docker environment values")
    write_private(path, "".join(f"{key}={value}\n" for key, value in values.items()))


def http_status(url: str, *, cookie: str | None = None, data: bytes | None = None) -> int:
    request = urllib.request.Request(url, data=data, headers={"Cookie": cookie} if cookie else {})
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, request, fp, code, msg, headers, newurl):
            return None

    opener = urllib.request.build_opener(NoRedirect())
    try:
        with opener.open(request, timeout=8) as response:
            return response.status
    except urllib.error.HTTPError as error:
        return error.code


def wait_http(url: str, expected: int, *, cookie: str | None = None) -> None:
    for _ in range(60):
        try:
            if http_status(url, cookie=cookie) == expected:
                return
        except (OSError, TimeoutError):
            pass
        time.sleep(2)
    raise RuntimeError(f"Target did not become ready: {url} (expected HTTP {expected})")


def metadata(run_dir: Path) -> dict:
    return json.loads((run_dir / "state.json").read_text())


def prepare(run_dir: Path) -> None:
    source_sha = check_source()
    if run_dir.exists():
        raise RuntimeError(f"Run directory already exists: {run_dir}")
    run_dir.mkdir(parents=True, mode=0o700)
    run_dir.chmod(0o700)
    run_id = f"{dt.datetime.now(dt.timezone.utc):%Y%m%d%H%M%S}-{secrets.token_hex(3)}"
    prefix = f"hlscan-{run_id}"
    state = {
        "run_id": run_id,
        "source_sha": source_sha,
        "internal_network": f"{prefix}-internal",
        "edge_network": f"{prefix}-edge",
        "web_container": f"{prefix}-web",
        "admin_container": f"{prefix}-admin",
        "gateway_container": f"{prefix}-gateway",
        "image": f"hyperlocal-security-audit:{source_sha[:12]}",
    }
    write_private(run_dir / "state.json", json.dumps(state, indent=2) + "\n")
    snapshot = run_dir / "snapshot"
    branch = call(["git", "branch", "--show-current"], cwd=REPO, echo=False).strip()
    if not branch:
        raise RuntimeError("Use a named branch for the audit source")
    call(["git", "clone", "--quiet", "--depth", "1", "--single-branch", "--branch", branch,
          REPO.resolve().as_uri(), str(snapshot)])
    if call(["git", "rev-parse", "HEAD"], cwd=snapshot, echo=False).strip() != source_sha:
        raise RuntimeError("Snapshot commit differs from source HEAD")
    (snapshot / ".dockerignore").write_text(".git\n.cache\n")

    tokens = {role: secrets.token_urlsafe(32) for role in ("admin", "user")}
    auth_secret = secrets.token_urlsafe(48)
    seed_database(run_dir / "web.db", tokens)
    shutil.copy2(run_dir / "web.db", run_dir / "admin.db")
    env_file(run_dir / "web.env", {
        "VITEST": "1", "DATABASE_URL": "file:/scan-state/audit.db", "TURSO_DATABASE_URL": "",
        "TURSO_AUTH_TOKEN": "", "GA_TRACKING_ID": "", "R2_ACCOUNT_ID": "", "R2_BUCKET_NAME": "",
        "R2_ACCESS_KEY_ID": "", "R2_SECRET_ACCESS_KEY": "", "R2_PUBLIC_URL": "",
        "PURGE_SECRET": secrets.token_urlsafe(24),
        "__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS": "host.docker.internal",
    })
    env_file(run_dir / "admin.env", {
        "VITEST": "1", "DATABASE_URL": "file:/scan-state/audit.db", "TURSO_DATABASE_URL": "",
        "TURSO_AUTH_TOKEN": "", "SESSION_SECRET": secrets.token_urlsafe(48),
        "BETTER_AUTH_SECRET": auth_secret, "BETTER_AUTH_URL": "http://localhost:4175",
        "GOOGLE_MAPS_API_KEY": "", "GOOGLE_GENERATIVE_AI_API_KEY": "",
        "GOOGLE_CLIENT_ID": "", "GOOGLE_CLIENT_SECRET": "",
        "ADMIN_EMAILS": "audit-admin@example.test", "WEB_ORIGIN": "http://localhost:4174",
        "PURGE_SECRET": secrets.token_urlsafe(24),
        "__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS": "host.docker.internal",
    })
    cookies = {role: make_cookie(tokens[role], auth_secret) for role in tokens}
    env_file(run_dir / "gateway.env", {
        "AUDIT_ADMIN_COOKIE": cookies["admin"], "AUDIT_USER_COOKIE": cookies["user"]
    })

    docker("build", "-t", state["image"], "-f", str(TOOL_DIR / "Dockerfile.target"), str(snapshot), stream=True)
    labels = ["--label", f"hyperlocal.audit.run={run_id}"]
    docker("network", "create", "--internal", *labels, state["internal_network"])
    docker("network", "create", *labels, state["edge_network"])
    for role, port in (("web", 4174), ("admin", 4175)):
        docker(
            "run", "-d", "--name", state[f"{role}_container"], *labels,
            "--network", state["internal_network"], "--network-alias", f"audit-{role}",
            "--cap-drop", "ALL", "--security-opt", "no-new-privileges",
            "--env-file", str(run_dir / f"{role}.env"),
            "-v", f"{run_dir / f'{role}.db'}:/seed.db:ro",
            state["image"], "sh", "-c",
            f"mkdir -p /scan-state && cp /seed.db /scan-state/audit.db && cd /app/apps/{role} && exec pnpm exec react-router dev --host 0.0.0.0 --port {port}",
        )
    docker(
        "run", "-d", "--name", state["gateway_container"], *labels,
        "--network", state["edge_network"],
        "-p", "127.0.0.1:4174:4174", "-p", "127.0.0.1:4176:4176",
        "--cap-drop", "ALL", "--security-opt", "no-new-privileges",
        "--env-file", str(run_dir / "gateway.env"),
        "-v", f"{TOOL_DIR / 'gateway.cjs'}:/gateway.cjs:ro",
        "node:24-bookworm-slim", "node", "/gateway.cjs",
    )
    docker("network", "connect", state["internal_network"], state["gateway_container"])
    wait_http("http://127.0.0.1:4174/", 200)
    wait_http("http://127.0.0.1:4176/login", 200)
    if http_status("http://127.0.0.1:4176/articles", cookie=cookies["admin"]) != 200:
        raise RuntimeError("Synthetic admin session did not reach the protected page")
    if http_status("http://127.0.0.1:4176/articles", cookie=cookies["user"]) == 200:
        raise RuntimeError("Synthetic non-admin session unexpectedly reached the protected page")
    print(f"Ready: {run_dir}\n  web: http://127.0.0.1:4174/\n  admin: http://127.0.0.1:4176/", flush=True)


def shannon_binary() -> Path:
    value = os.environ.get("SHANNON_BIN", str(PINNED_SHANNON))
    resolved = shutil.which(value)
    if not resolved:
        raise RuntimeError("Set SHANNON_BIN to an installed Shannon executable")
    return Path(resolved).resolve()


def validation_complete(binary: Path, workspace: str, env: dict[str, str]) -> bool:
    result = subprocess.run(
        [str(binary), "status", workspace], cwd=binary.parent, env=env,
        capture_output=True, text=True,
    )
    return result.returncode == 0 and f"Scan: {workspace} completed" in result.stdout


def scan(run_dir: Path, target: str, validate_only: bool = False) -> None:
    state = metadata(run_dir)
    binary = shannon_binary()
    targets = ("web", "admin") if target == "all" else (target,)
    env = os.environ.copy()
    env.setdefault("SHANNON_USE_PI_AUTH", "1")
    env.setdefault("SHANNON_AI_MODEL", "openai:gpt-6-sol")
    if env["SHANNON_USE_PI_AUTH"] == "1":
        for key in ("OPENAI_API_KEY", "OPENAI_BASE_URL", "SHANNON_AI_API_KEY", "SHANNON_AI_BASE_URL"):
            env.pop(key, None)
    for name in targets:
        workspace = f"{state['run_id']}-{name}"
        command = [str(binary), "start", "--url", f"http://host.docker.internal:{PORTS[name]}",
                   "--repo", str(run_dir / "snapshot"),
                   "--config", str(TOOL_DIR / f"{name}.yaml")]
        model_workspace = f"{workspace}-model"
        if not validation_complete(binary, model_workspace, env):
            call([*command, "--workspace", model_workspace, "--validate-model"], cwd=binary.parent, env=env)
        if name == "admin":
            auth_workspace = f"{workspace}-auth"
            if not validation_complete(binary, auth_workspace, env):
                call([*command, "--workspace", auth_workspace, "--validate-auth"], cwd=binary.parent, env=env)
        if validate_only:
            continue
        out = run_dir / "reports" / name
        out.mkdir(parents=True, exist_ok=True)
        call([*command, "--workspace", workspace, "--output", str(out), "--follow"], cwd=binary.parent, env=env, stream=True)
        status = call([str(binary), "status", workspace], cwd=binary.parent, env=env)
        if "completed" not in status.lower():
            raise RuntimeError(f"Shannon workspace is not complete: {workspace}")
        if not (out / "comprehensive_security_assessment_report.md").exists():
            raise RuntimeError(f"Shannon did not copy a final report into {out}")
        # --output publishes Markdown/PDF/SARIF. Preserve structured and SAST
        # results from a source build when its local workspace is available.
        internal = binary.parent / "workspaces" / workspace / ".shannon"
        for source, destination in (
            (internal / "deliverables/report.json", out / "report.json"),
            (internal / "capella/report.md", out / "capella-report.md"),
        ):
            if source.is_file():
                shutil.copy2(source, destination)


def clean(run_dir: Path) -> None:
    state = metadata(run_dir)
    label = f"hyperlocal.audit.run={state['run_id']}"
    for key in ("gateway_container", "admin_container", "web_container"):
        name = state[key]
        found = subprocess.run(["docker", "inspect", "-f", '{{index .Config.Labels "hyperlocal.audit.run"}}', name],
                               capture_output=True, text=True)
        if found.returncode == 0:
            if found.stdout.strip() != state["run_id"]:
                raise RuntimeError(f"Refusing to remove unowned container {name}")
            docker("rm", "-f", name)
    for key in ("internal_network", "edge_network"):
        name = state[key]
        found = subprocess.run(["docker", "network", "inspect", "-f", '{{index .Labels "hyperlocal.audit.run"}}', name],
                               capture_output=True, text=True)
        if found.returncode == 0:
            if found.stdout.strip() != state["run_id"]:
                raise RuntimeError(f"Refusing to remove unowned network {name}")
            docker("network", "rm", name)
    print(f"Stopped audit containers and networks for {label}. Files remain at {run_dir}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=("prepare", "validate", "scan", "run", "clean"))
    parser.add_argument("--run-dir", type=Path)
    parser.add_argument("--target", choices=("web", "admin", "all"), default="all")
    args = parser.parse_args()
    if args.command in ("validate", "scan", "clean") and args.run_dir is None:
        parser.error("--run-dir is required for an existing run")
    run_dir = (args.run_dir or (DEFAULT_RUNS / dt.datetime.now(dt.timezone.utc).strftime("%Y%m%d-%H%M%S"))).resolve()
    if args.command in ("prepare", "run"):
        if run_dir.exists():
            raise RuntimeError(f"Run directory already exists: {run_dir}")
        try:
            prepare(run_dir)
        except Exception:
            if (run_dir / "state.json").exists():
                clean(run_dir)
            raise
    if args.command in ("validate", "scan", "run"):
        try:
            scan(run_dir, args.target, validate_only=args.command == "validate")
        finally:
            if args.command == "run":
                clean(run_dir)
    elif args.command == "clean":
        clean(run_dir)


if __name__ == "__main__":
    try:
        main()
    except (RuntimeError, subprocess.CalledProcessError) as error:
        print(f"Audit failed: {error}", file=sys.stderr)
        sys.exit(1)
