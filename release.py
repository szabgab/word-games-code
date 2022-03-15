#!/usr/bin/env python
import datetime
import json
import os
import shutil
import sys
import tempfile

def main():
    if len(sys.argv) != 3:
        exit(f"{sys.argv[0]} environment directory\n  (environment=production, directory=.)")
    environment, directory = sys.argv[1:]
    target_path = os.path.abspath(directory)
    root = os.path.dirname(os.path.abspath(__file__))
    #print(root)

    copy_code(root, target_path)
    copy_cname(target_path)
    copy_data(root, environment, target_path)


def copy_code(root, target_path):
    source = os.path.join(root, 'docs')
    target = os.path.join(target_path, 'docs')
    shutil.copytree(source, target, dirs_exist_ok=True)

def copy_cname(target_path):
    shutil.copyfile(os.path.join(target_path, 'CNAME'), os.path.join(target_path, 'docs', 'CNAME'))


# copy the data files from the various other repositories
# check the data before copying them?
def copy_data(root, environment, target_path):
    original_config_file = os.path.join(root,  f'{environment}.json')
    target_config_file = os.path.join(target_path, 'docs', 'games.json')

    with open(original_config_file) as fh:
        config = json.load(fh)

    # print(config)
    config["meta"]["release_date"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    stats = {}
    cwd = os.getcwd()
    for id, cfg in config["games"].items():
        #print(cfg)
        repo = cfg['source']
        print(repo)
        tdir = tempfile.mkdtemp()
        print(tdir)
        os.chdir(tdir)
        os.system(f"git clone {repo} temp")
        os.system("ls -l")
        categories_file = os.path.join('temp', "categories.json")
        try:
            with open(categories_file) as fh:
                categories = json.load(fh)
            shutil.copy(categories_file, os.path.join(target_path, 'docs', 'data', 'categories', cfg['file']))
        except Exception as err:
            print(err)
            del config["games"][id]
            continue
        stats[id] = {
            "categories": len(categories.keys()),
            "words": sum([len(words) for words in categories.values()]),
        }

        os.chdir(cwd)
        shutil.rmtree(tdir)
    with open(os.path.join(target_path, 'docs', 'data', 'stats.json'), "w") as fh:
        json.dump(stats, fh, sort_keys=True, indent=4, separators=(',', ': '), ensure_ascii=False)
    with open(target_config_file, "w") as fh:
        json.dump(config, fh, sort_keys=True, indent=4, separators=(',', ': '), ensure_ascii=False)


main()

