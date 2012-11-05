# For returning .js file extensions changed to .txt 
# (to avoid email security stripping it out)
txt:
	ls js/*.js | awk '{print("mv "$$1" "$$1)}' | sed 's/\.js/.txt/2' | /bin/sh
# Convert txt back to js
js:
	ls js/*.txt | awk '{print("mv "$$1" "$$1)}' | sed 's/\.txt/.js/2'| /bin/sh

.PHONY: txt js
