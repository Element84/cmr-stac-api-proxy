#!/bin/bash

# [✅] Grab stac.yaml and wfs3.yaml 
# [✅] Merge them together
# [✅] Remove unnecessary file files
# [✅] Run test
# [] Log results of test
# [] Email devs with results
#    - email log of results, they need a link to update jargan
# [] Fix broken test
# [] Write test around new specs

curl -O https://raw.githubusercontent.com/radiantearth/stac-spec/blob/master/api-spec/openapi/STAC.yaml
curl -O https://raw.githubusercontent.com/radiantearth/stac-spec/blob/master/api-spec/openapi/WFS3.yaml

touch STAC.merge.yaml
echo "!!files_merge_append ["./WFS3.yaml", "./STAC.yaml"]" >> STAC.merge.yaml

yaml-files STAC.merge.yaml WFS3core+STAC.yaml

rm STAC.yaml WFS3.yaml STAC.merge.yaml

npm test



------------------------------------------
