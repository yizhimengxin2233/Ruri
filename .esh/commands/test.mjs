import { CardFileInfo } from "../../src/cardinfo.mjs"
import { encoder } from "../../src/get_token_size.mjs"
import { promptBuilder } from "../../src/prompt_builder.mjs"

CardFileInfo.readDataFiles()
let result = promptBuilder(CardFileInfo.metaData, process.argv[2] || 'Have a nice pee.', console.log)
encoder.free()
for (let key in result) if (!result[key]?.length) delete result[key]
console.dir(result, { depth: null })
