variable "db_path" {
  type    = string
  default = getenv("DATABASE_PATH")
}

env "local" {
  url = "sqlite://${var.db_path != "" ? var.db_path : "../../data/dev.db"}?_fk=1"
  dev = "sqlite://file?mode=memory&_fk=1"
  src = "file://schema.sql"
}

env "production" {
  url = "libsql+wss://${getenv("TURSO_DATABASE_URL")}?authToken=${getenv("TURSO_AUTH_TOKEN")}"
  dev = "sqlite://file?mode=memory&_fk=1"
  src = "file://schema.sql"
}
