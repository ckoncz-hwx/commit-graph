git = require('simple-git/promise')('/Users/ckoncz/work/git/hwx/atlas')

main().then(v => console.log(v))

async function main() {
    var tickets = [
        //         'ATLAS-2075 - already present
        // 'ATLAS-2198 - ap
        'ATLAS-2421',
        'ATLAS-2439',
        'ATLAS-2491',
        'ATLAS-2524',
        'ATLAS-2581',
        'ATLAS-2611',
        'ATLAS-2634',
        'ATLAS-2751',
        'ATLAS-2827',
        'ATLAS-2836',
        'ATLAS-2877',
        'ATLAS-2878']
    var commits = await getCommits()
    var promises = []
    var files = {}

    commits.forEach(c => {
        promises.push((async () => {
            c.files = await getFiles(c.id)
        })());
    });

    await Promise.all(promises)

    commits.forEach(c => {
        c.files.forEach(f => {
            if (!files[f]) {
                files[f] = []
            }
            files[f].push(c)
        })
    })

    var tCommits = []
    tickets.forEach(t => {
        commits.forEach(c => {
            if (c.msg.indexOf(t) >= 0) {
                if (tCommits.indexOf(c) < 0) {
                    tCommits.push(c)
                }
            }
        })
    })

    var collected = []
    var graphData = {
        nodes: [],
        links: []
    }
    // tCommits = tCommits.slice(1,2)
    tCommits.forEach(c => {
        console.log(c.id + ': ' + c.msg)
        collectDeps(c, collected, 1)
    })

    collected.forEach(c => {
        graphData.nodes.push({
            id: c.id,
            msg: c.msg,
            files: c.files,
            deps: c.deps.map(d => d.id),
            requested: tCommits.indexOf(c) >= 0
        })
    })
    console.log('collected=', collected.length)

    collected.sort((c1, c2) => {
        return commits.indexOf(c2) - commits.indexOf(c1)
    })

    if (false) {
        for (let i = 0; i < collected.length; i++) {
            let c = collected[i]
            console.log(` * cherry-picking ${c.id}: ${c.msg}`);
            await cherryPick(c.id)
        }
    }

    require('fs').writeFileSync('commit-graph.json', JSON.stringify(graphData, null, 2))

    return collected.map(c => c.id + ' [' + c.deps.length + ']: ' + c.msg);

    function collectDeps(commit, collected, depth) {
        if (collected.indexOf(commit) >= 0) {
            return;
        }
        collected.push(commit)
        commit.deps = []
        commit.files.forEach(f => {
            var fCommits = files[f];
            var i = fCommits.indexOf(commit);
            fCommits.slice(i + 1).forEach(c => {
                if (commit.deps.indexOf(c) < 0) {

                    commit.deps.push(c)
                    console.log(indent(depth) + c.id + ': ' + c.msg)
                    graphData.links.push({
                        source: commit.id,
                        target: c.id,
                        name: f
                    })

                    collectDeps(c, collected, depth + 1)
                }
            })
        })
    }

    function indent(depth) {
        var s = "";
        while (depth > 0) {
            s += "  "
            depth--
        }
        return s
    }
}
async function cherryPick(commitId) {
    return await git.raw(['cherry-pick', commitId])
}
async function getFiles(commitId) {
    return (await git.show(['--name-only', '--pretty=', commitId])).split('\n').filter(f => f.length > 0)
}

async function getCommits() {
    var commits = await git.raw(['log', '--pretty=oneline', '--max-count=165', '--format=%h %s', 'origin/2.6-maint'])
    return commits.split('\n').filter(c => c.length > 0).map(c => {
        var i = c.indexOf(' ');
        return {
            id: c.substring(0, i),
            msg: c.substring(i + 1)
        };
    })
}