import { config as dotenvConfig } from 'dotenv'
import { S3Client, ListObjectsV2Command, CopyObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'

dotenvConfig({ path: '.env.local' })
dotenvConfig()

const bucket = process.env.S3_BUCKET
const endpoint = process.env.S3_ENDPOINT
const region = process.env.S3_REGION
const accessKeyId = process.env.S3_ACCESS_KEY_ID
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY

if (!bucket || !endpoint || !accessKeyId || !secretAccessKey) {
  throw new Error('Missing S3 env vars. Required: S3_BUCKET, S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY')
}

const renames = [
  { id: 33, oldFilename: 'c3fe54_2f137c5f961a4b9aa7f92223412d434e-mv2.png', newFilename: 'legacy-tech-emblem-translucent.png' },
  { id: 34, oldFilename: 'c3fe54_3250050e36034babb7da405063c260b8-mv2.png', newFilename: 'legacy-transparent-boot.png' },
  { id: 35, oldFilename: 'c3fe54_badf458bb0b7405ca1e4f5b9c8d6f1dd-mv2.png', newFilename: 'legacy-transparent-smart-glasses.png' },
  { id: 36, oldFilename: 'c3fe54_1764b28e24ee42508e524a993262ef4b-mv2.png', newFilename: 'legacy-transparent-dome-home-cutaway.png' },
  { id: 37, oldFilename: 'c3fe54_bc834093a2234f2e85edac2c12e20723-mv2.png', newFilename: 'legacy-transparent-evtol-aircraft.png' },
  { id: 38, oldFilename: 'c3fe54_29f2e4230e4d456da9fe206715f535a9-mv2.png', newFilename: 'legacy-transparent-robotic-hand.png' },
  { id: 39, oldFilename: 'c3fe54_6ac6d5681500426284f90c667ef3f3ad-mv2.png', newFilename: 'legacy-geometric-layered-star.png' },
  { id: 40, oldFilename: 'c3fe54_4fc1c74a8eb74956a3af0c1145b9f455-mv2.png', newFilename: 'legacy-stacked-square-tiles.png' },
  { id: 41, oldFilename: 'c3fe54_a3757d57559c421c91843bd40773a7e0-mv2.png', newFilename: 'legacy-abstract-layered-clover-form.png' },
  { id: 42, oldFilename: 'c3fe54_44b8d08d91314e4db6bf0a0a34c313c0-mv2.png', newFilename: 'legacy-abstract-folded-flower-form.png' },
  { id: 43, oldFilename: 'c3fe54_051b8b18c4444102bf98f641f01914bc-mv2.png', newFilename: 'legacy-blueprint-smart-glasses.png' },
  { id: 44, oldFilename: 'c3fe54_52c2a8fba7e3448fa036a8dd501540dc-mv2.png', newFilename: 'legacy-blueprint-boot.png' },
  { id: 45, oldFilename: 'c3fe54_d9fed6be1cd44833b056c8d5c7aecc6f-mv2.png', newFilename: 'legacy-blueprint-evtol-aircraft.png' },
  { id: 46, oldFilename: 'c3fe54_e52538d56d2049a8994d8e708355ada4-mv2.png', newFilename: 'legacy-blueprint-dome-home-cutaway.png' },
  { id: 47, oldFilename: 'c3fe54_911e789c369b43cc833028d29b2b829e-mv2.png', newFilename: 'legacy-blueprint-futuristic-shoe.png' },
  { id: 48, oldFilename: 'c3fe54_b998152576f744d89c9565007841eb38-mv2.png', newFilename: 'legacy-blueprint-robotic-crawler.png' },
  { id: 49, oldFilename: '037a25_e3e73c35d566433fa958a54696b69633.pdf', newFilename: 'legacy-factsheet-usd.pdf' },
  { id: 50, oldFilename: '037a25_4f821338d34e4ad082c86d13bd46c757.pdf', newFilename: 'legacy-fund-commentary.pdf' },
  { id: 51, oldFilename: '037a25_671093d7123f482e9e90bf53264f0f85.pdf', newFilename: 'legacy-factsheet-chf-hedged.pdf' },
  { id: 52, oldFilename: '037a25_eb4acc9f30f64bc6a3cb83cd325b4333.pdf', newFilename: 'legacy-fund-presentation.pdf' },
  { id: 91, oldFilename: 'file.mp4', newFilename: 'about-us-team-video.mp4' },
]

const s3 = new S3Client({
  region,
  endpoint,
  forcePathStyle: true,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
})

function splitName(filename) {
  const dot = filename.lastIndexOf('.')
  if (dot < 1) return { stem: filename, ext: '' }
  return { stem: filename.slice(0, dot), ext: filename.slice(dot) }
}

async function listKeysByPrefix(prefix) {
  const keys = []
  let token = undefined
  do {
    const res = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: token,
      }),
    )
    for (const item of res.Contents || []) {
      if (item.Key) keys.push(item.Key)
    }
    token = res.NextContinuationToken
  } while (token)
  return keys
}

async function exists(key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
    return true
  } catch {
    return false
  }
}

async function copyKey(sourceKey, destinationKey) {
  await s3.send(
    new CopyObjectCommand({
      Bucket: bucket,
      CopySource: `${bucket}/${sourceKey}`,
      Key: destinationKey,
      MetadataDirective: 'COPY',
    }),
  )
}

async function run() {
  let copiedCount = 0
  let skippedExisting = 0

  for (const entry of renames) {
    const { stem: oldStem } = splitName(entry.oldFilename)
    const { stem: newStem } = splitName(entry.newFilename)

    const keys = await listKeysByPrefix(oldStem)
    const relevantKeys = keys.filter((key) => key === entry.oldFilename || key.startsWith(`${oldStem}-`))

    if (relevantKeys.length === 0) {
      console.log(`[warn] No storage keys found for ${entry.oldFilename}`)
      continue
    }

    for (const sourceKey of relevantKeys) {
      const suffix = sourceKey.slice(oldStem.length)
      const destinationKey = `${newStem}${suffix}`
      if (await exists(destinationKey)) {
        skippedExisting++
        continue
      }

      await copyKey(sourceKey, destinationKey)
      copiedCount++
      console.log(`[copy] ${sourceKey} -> ${destinationKey}`)
    }
  }

  console.log(`Done. copied=${copiedCount}, skipped_existing=${skippedExisting}`)
}

await run()
