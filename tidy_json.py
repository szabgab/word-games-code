#!/usr/bin/env python3
import json
import glob
import sys

# format the json files

def tidy(filename):
    print(filename)
    with open(filename) as fh:
        data = json.load(fh)
    for category in data.keys():
        data[category].sort()
    with open(filename, 'w') as fh:
        json.dump(data, fh, sort_keys=True, indent=4, separators=(',', ': '), ensure_ascii=False)

for filename in sys.argv[1:]:
    tidy(filename)

# vim: expandtab