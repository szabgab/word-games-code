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
    copy_config(root, environment, target_path)
    copy_data(target_path)


def copy_code(root, target_path):
    source = os.path.join(root, 'docs')
    target = os.path.join(target_path, 'docs')
    shutil.copytree(source, target, dirs_exist_ok=True)

def copy_cname(target_path):
    shutil.copyfile(os.path.join(target_path, 'CNAME'), os.path.join(target_path, 'docs', 'CNAME'))

def copy_config(root, environment, target_path):
    shutil.copyfile(os.path.join(root,  f'{environment}.json'), os.path.join(target_path, 'docs', 'games.json'))

# copy the data files from the various other repositories
# check the data before copying them?
def copy_data(target_path):
    config_file = os.path.join(target_path, 'docs', 'games.json')
    with open(config_file) as fh:
        config = json.load(fh)
    # print(config)
    config["meta"]["release_date"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    with open(config_file, "w") as fh:
        json.dump(config, fh, sort_keys=True, indent=4, separators=(',', ': '), ensure_ascii=False)

    cwd = os.getcwd()
    for cfg in config["games"].values():
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
                json.load(fh)
            shutil.copy(categories_file, os.path.join(target_path, 'docs', 'data', 'categories', cfg['file']))
        except Exception as err:
            print(err)
        os.chdir(cwd)
        shutil.rmtree(tdir)



main()

