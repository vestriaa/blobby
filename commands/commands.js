import { unbeaten } from './unbeaten.js'
import { trending } from './trending.js'
import { actualTrending } from './actualTrending.js'
import { topTrending } from './topTrending.js'
import { topUnbeaten } from './topUnbeaten.js'
import { newestUnbeaten } from './newestUnbeaten.js'
import { globalStats } from './globalStats.js'
import { leaderboard } from './leaderboard.js'
import { level } from './level.js'
import { id } from './id.js'
import { player } from './player.js'
import { whoIs } from './whoIs.js'
import { random } from './random.js'
import { newest } from './newest.js'
import { oldest } from './oldest.js'
import { getHardest } from './getHardest.js'
import { hardest } from './hardest.js'
import { wiki } from './wiki.js'
import { getLeaderboard } from './getLeaderboard.js'
import { getCreator } from './getCreator.js'
import { getComplexity } from './getComplexity.js'
import { getIterations } from './getIterations.js'
import { getThumbnail } from './getThumbnail.js'
import { script } from './script.js'

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