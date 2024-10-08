import seedrandom from 'seedrandom'
import { WorldInfoEntry } from './charData.mjs'
import { deepCopy, RandIntLeesThan as RandIntLeesThanBase, reverseStr, suffleArray as suffleArrayBase } from './tools.mjs'

var randomCommts = [
	"东西", '不是东西', '可能是个东西', '这到底是不是东西？', '可能不是个东西', '我是不是东西？', '我不是东西', '懂了，我是南北',
	'屎', '史记',
	'菠萝', '萝萝', '菠菠',
	'苹果', '苹苹', '果果',
	'菠萝苹果',
	'神经', '寄吧', '我是傻逼', '？', '我去'
]
let cryptoStrs = ["\u202e", "\u2066"]
let cryptoStrsX = ["\u0E4e", "\u0E49", "\u0E47"]
let mindlessStr = "毒毒杀救了我红死自杀恨死蛇猩红腐败癫狂毒杀救了我红死自杀恨死蛇混乱堕落崩溃疯和蛇病骷毒杀救？？？了我红死自杀恨死蛇髅瘟疫死毒杀救了，。我红死自杀恨死蛇亡毒杀救了我红死！！！！自杀恨死蛇悲剧灾难的惨恐怖事痛苦扭曲救！？—杀爱恨我你\n\n\n\n"

/** @type {seedrandom.PRNG} */
var BaseRng
function SetCryptoBaseRng(seed) {
	BaseRng = seedrandom(seed)
}
let RandIntLeesThan = (x, y = 0) => RandIntLeesThanBase(x, y, BaseRng)
let suffleArray = (a) => suffleArrayBase(a, BaseRng)
let GetRandomCryptoBaseStr = _ => cryptoStrs[RandIntLeesThan(cryptoStrs.length)]
let GetRandomCryptoXBaseStr = _ => cryptoStrsX[RandIntLeesThan(cryptoStrsX.length)].repeat(RandIntLeesThan(7))
let GetRandomCryptoStrBy = _ => {
	let aret = ''
	for (let i = 0; i < RandIntLeesThan(24, 7); i++)
		switch (RandIntLeesThan(4)) {
			case 0:
				aret += GetRandomCryptoXBaseStr().repeat(RandIntLeesThan(9))
				i += RandIntLeesThan(7)
				break
			case 1:
				aret += GetRandomCryptoBaseStr()
				break
			case 2:
				aret += _.repeat(RandIntLeesThan(2))
				i += RandIntLeesThan(2)
				break
			default:
				aret += mindlessStr[RandIntLeesThan(mindlessStr.length)].repeat(RandIntLeesThan(8))
				i += RandIntLeesThan(6)
				break
		}
	return aret
}
let cryptoTextContent = (/** @type {string} */content) => {
	content = content.split('\n')
	for (let i = 0; i < content.length; i++) {
		let line = content[i]
		if (line.search(/(\{\{|\}\})/g) != -1) continue
		if (RandIntLeesThan(4) == 2)
			content[i] = `{{reverse::${reverseStr(line)}}}`
	}
	content = content.join("\n{{//\u202e}}")
	for (let i = 0; i < content.length; i++) {
		if (content.slice(0, i).match(/\{[^\{\}]*$/g) || '{}'.indexOf(content[i]) != -1) continue
		if (RandIntLeesThan(7) == 6) {
			let rand = GetRandomCryptoStrBy(content[i])
			content = content.slice(0, i) + `{{//${rand}}}` + content.slice(i)
			i += rand.length + 6
		}
	}
	return content
}
let cryptoEntryContent = (/** @type {WorldInfoEntry} */entrie) => {
	entrie.content = "{{//\u202e}}" + cryptoTextContent(entrie.content)
}
let cryptoKeyList = (/** @type {string[]} */list) => {
	let aret = []
	for (let i = 0; i < list.length; i++) {
		if (list[i].includes('{') || list[i].includes('}')) {
			aret.push(list[i])
			continue
		}
		if (RandIntLeesThan(3) == 2) {
			let rand = GetRandomCryptoStrBy(list[RandIntLeesThan(list.length)])
			aret.push(`{{//${rand}}}`)
		}
		aret.push(cryptoTextContent(list[i]))
	}
	if (aret.length)
		aret[0] = "{{//\u202e}}" + aret[0]
	return aret
}
function WIbookCrypto(/** @type {WorldInfoEntry[]} */book) {
	book = book.sort((a, b) => a.insertion_order - b.insertion_order)
	var index = 0
	for (var entrie of book) entrie.insertion_order = index++
	index = 0
	var newbook = []
	for (var entrie of book) {
		entrie.insertion_order = index++
		if (!entrie.enabled) { newbook.push(entrie); continue }
		var contentArr = entrie.content.split('\n')
		for (var text of contentArr)
			if (text.length) {
				var entriebase = deepCopy(entrie)
				entriebase.content = text
				entriebase.insertion_order = index++
				newbook.push(entriebase)
			} else newbook[newbook.length - 1].content += '\n'

	}
	book = newbook
	let currentIndex = book.length

	while (currentIndex != 0) {
		let randomIndex = RandIntLeesThan(currentIndex)
		let randomIndex2 = RandIntLeesThan(currentIndex)
		currentIndex--;

		[book[currentIndex], book[randomIndex]] = [book[randomIndex], book[currentIndex]];
		[book[currentIndex].extensions.display_index, book[randomIndex2].extensions.display_index] = [book[randomIndex2].extensions.display_index, book[currentIndex].extensions.display_index]
	}

	var uid = 81504
	let orderList = []
	for (var entrie of book) {
		entrie.id = uid += RandIntLeesThan(724, 1)
		orderList.push(entrie.insertion_order)
		if (!entrie.enabled) continue
		entrie.comment = randomCommts[RandIntLeesThan(randomCommts.length)]
		suffleArray(entrie.keys)
		entrie.keys = cryptoKeyList(entrie.keys)
		suffleArray(entrie.secondary_keys)
		entrie.secondary_keys = cryptoKeyList(entrie.secondary_keys)
		cryptoEntryContent(entrie)
		entrie.tanji = 1
	}
	orderList = [...new Set(orderList.sort((a, b) => a - b))]
	let cryptedOrderList = []
	index = 45450721
	for (var _ of orderList) cryptedOrderList.push(index += RandIntLeesThan(360, 1))
	for (var entrie of book)
		entrie.insertion_order = cryptedOrderList[orderList.indexOf(entrie.insertion_order)]
	book.push({
		id: "🤓",
		content: '',
		enabled: false,
	})
	return book
}
export {
	WIbookCrypto,
	SetCryptoBaseRng,
	WIbookCrypto as default
}
