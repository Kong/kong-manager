#!/bin/bash
set -e

previous=$(
  gh release view $RELEASE_TAG_NAME -R $GH_REPOSITORY >/dev/null 2>&1
  if [[ $? == 0 ]]; then
    echo true
  else
    echo false
  fi
)

if $previous; then
  echo "Release already exists"
  echo "Replacing assets..."
  gh release upload $RELEASE_TAG_NAME release.tar.gz --clobber -R $GH_REPOSITORY
else
  echo "No previous release found"
  echo "Creating a new release with assets..."
  gh release create $RELEASE_TAG_NAME -t $RELEASE_TAG_NAME --target $RELEASE_TARGET -R $GH_REPOSITORY release.tar.gz
fi
