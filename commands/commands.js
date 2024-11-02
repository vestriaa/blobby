import { unbeaten } from './commands/unbeaten.js'
import { trending } from './commands/trending.js'
import { actualTrending } from './commands/actualTrending.js'
import { topTrending } from './commands/topTrending.js'
import { topUnbeaten } from './commands/topUnbeaten.js'
import { newestUnbeaten } from './commands/newestUnbeaten.js'
import { globalStats } from './commands/globalStats.js'
import { leaderboard } from './commands/leaderboard.js'
import { level } from './commands/level.js'
import { id } from './commands/id.js'
import { player } from './commands/player.js'
import { whoIs } from './commands/whoIs.js'
import { random } from './commands/random.js'
import { newest } from './commands/newest.js'
import { oldest } from './commands/oldest.js'
import { getHardest } from './commands/getHardest.js'
import { hardest } from './commands/hardest.js'
import { wiki } from './commands/wiki.js'
import { getLeaderboard } from './commands/getLeaderboard.js'
import { getCreator } from './commands/getCreator.js'
import { getComplexity } from './commands/getComplexity.js'
import { getIterations } from './commands/getIterations.js'
import { getThumbnail } from './commands/getThumbnail.js'
import { script } from './commands/script.js'

const commands = {
    unbeaten,
    trending,
    "actualtrending": actualTrending,
    "toptrending": topTrending,
    "topunbeaten": topUnbeaten,
    "newestunbeaten": newestUnbeaten,
    "globalstats": globalStats,
    leaderboard,
    level,
    id,
    player,
    "whois": whoIs,
    random,
    newest,
    oldest,
    "gethardest": getHardest,
    hardest,
    wiki,
    "Get leaderboard": getLeaderboard,
    "Get creator": getCreator,
    "Get complexity": getComplexity,
    "Get iterations": getIterations,
    "Get thumbnail": getThumbnail,
    script,
};

export { commands };