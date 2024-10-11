import * as acorn from 'acorn'
import * as walk from 'acorn-walk'
import * as cheerio from 'cheerio'

export function extractAppInitializationState(html: string) {
  const $ = cheerio.load(html)
  const scripts = $('script')
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  let appInitializationState: any | null = null

  for (let i = 0; i < scripts.length; i++) {
    const content = $(scripts[i]).html()
    if (!content) continue

    try {
      const ast = acorn.parse(content, { ecmaVersion: 2020 })

      walk.simple(ast, {
        AssignmentExpression(node) {
          if (
            node.left.type === 'MemberExpression' &&
            ((node.left.object.type === 'Identifier' &&
              node.left.object.name === 'window') ||
              node.left.object.type === 'ThisExpression') &&
            node.left.property.type === 'Identifier' &&
            node.left.property.name === 'APP_INITIALIZATION_STATE'
          ) {
            const valueNode = node.right
            const valueCode = content.slice(valueNode.start, valueNode.end)

            try {
              // JSON としてパースを試みる
              appInitializationState = JSON.parse(valueCode)
            } catch (jsonError) {
              // JSON パースに失敗した場合、Function を使用して評価
              try {
                appInitializationState = new Function(`return (${valueCode})`)()
              } catch (funcError) {
                console.error(
                  'Error evaluating APP_INITIALIZATION_STATE:',
                  funcError,
                )
              }
            }

            // APP_INITIALIZATION_STATE が見つかったらループを終了
            return false
          }
        },
      })

      // APP_INITIALIZATION_STATE が見つかったらループを終了
      if (appInitializationState !== null) {
        break
      }
    } catch (e) {
      console.error('Error parsing script:', e)
    }
  }

  return appInitializationState
}

export const crawlGoogleMaps = async () => {
  try {
    const ret = await fetch(
      'https://www.google.com/maps/place/?q=place_id:ChIJG7k9efyLGGARy12VNvIo8xk',
    )
    const htmlString = await ret.text()
    const result = extractAppInitializationState(htmlString)
    // 経度緯度
    const [longitude, latitude] = result[0][0].slice(1, 3)
    const data = result[3]
    console.log(`https://www.google.co.jp/maps/@${latitude},${longitude},18z`)

    const appData = eval(data[6].split('\n')[1])
    //    console.dir(appData, { depth: null })
  } catch (error) {
    console.error('Error crawling Google Maps:', error)
  }
}
