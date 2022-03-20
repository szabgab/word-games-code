#!/usr/bin/env python3
import json
import glob
import sys

# format the json files

def tidy(filename):
    #print(filename)
    with open(filename) as fh:
        data = json.load(fh)
    for category in data.keys():
        data[category] = sorted(set(data[category]))
    with open(filename, 'w') as fh:
        json.dump(data, fh, sort_keys=True, indent=4, separators=(',', ': '), ensure_ascii=False)

if __name__== '__main__':
    for filename in sys.argv[1:]:
        tidy(filename)

# vim: expandtab
