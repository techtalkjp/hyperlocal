import { areas } from '@hyperlocal/consts'
import { translateAreaTask } from './tasks'

export const translate = async (areaIds: string[]) => {
  for (const areaId of areaIds) {
    if (!areas.find((area) => area.areaId === areaId)) {
      console.log(`エリアID ${areaId} が見つかりません`)
      continue
    }
    await translateAreaTask(areaId)
  }
  return
}
