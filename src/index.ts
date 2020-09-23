import {Command, flags} from '@oclif/command'
import {writeFileSync} from 'fs'
import {gitToObj, jsonReplacer} from './git'

class Git2Obj extends Command {
  static description = 'describe the command here'

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({char: 'v'}),
    help: flags.help({char: 'h'}),
    gitDir: flags.string({char: 'g', description: 'the git repo path'}),
    // flag with a value (-n, --name=VALUE)
    // name: flags.string({char: 'n', description: 'name to print'}),
    // flag with no value (-f, --force)
    // force: flags.boolean({char: 'f'}),
  }

  static args = [
    {name: 'gitWorkDir', description: 'the git work directory'},
    {name: 'out', description: 'the out file'},
  ]

  async run() {
    const {args, flags} = this.parse(Git2Obj)
    const gitWorkDir = args.gitWorkDir
    const out = args.out
    const gitDir = flags.gitDir
    const opts = {} as any
    if (gitWorkDir) opts.dir = gitWorkDir
    if (gitDir) opts.gitdir = gitDir
    const objects = await gitToObj(opts)
    const text = JSON.stringify(objects, jsonReplacer, 2)

    if (out) writeFileSync(out, text)
    else this.log(text)
  }
}

export = Git2Obj
