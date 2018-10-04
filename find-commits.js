git = require('simple-git/promise')('/Users/ckoncz/work/git/hwx/atlas')

main().then(v => console.log(v))

async function main() {
    var tickets = [
        'ATLAS-2075',// - already present
        'ATLAS-2198',// - ap
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
        'ATLAS-2878'];

    tickets = ['ATLAS-2276', 'ATLAS-2442']
    var bugs = {
        'ATLAS-2611': ['BUG-101749']
    }


    var branch = process.argv[2]
    if (!branch) {
        console.error('Please specify a branch as a command line argument')
        console.error("e.g. 'origin/2.6-maint' or 'origin/HDP-3.0-maint' ")
        return 'NO BRANCH'
    }

    console.log('branch=', branch)
    var commits = await getCommits(branch, 500)

    var tCommits = []
    tickets.forEach(t => {
        commits.forEach(c => {
            if (c.msg.indexOf(t) >= 0) {
                if (tCommits.indexOf(c) < 0) {
                    tCommits.push(c)
                }
            }
            var bugsForTicket = bugs[t]
            if (bugsForTicket) {
                bugsForTicket.forEach(bt => {
                    if (c.msg.indexOf(bt) >= 0) {
                        if (tCommits.indexOf(c) < 0) {
                            tCommits.push(c)
                        }
                    }
                })
            }
        })
    })

    var collected = []
    // tCommits = tCommits.slice(1,2)
    tCommits.forEach(c => {
        console.log(c.id + ': ' + c.msg)
    })
}

async function getCommits(branch, maxCount) {
    var commits = await git.raw(['log', '--pretty=oneline', `--max-count=${maxCount}`, '--format=%h %s', branch])
    return commits.split('\n').filter(c => c.length > 0).map(c => {
        var i = c.indexOf(' ');
        return {
            id: c.substring(0, i),
            msg: c.substring(i + 1)
        };
    })
}