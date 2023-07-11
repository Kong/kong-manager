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
  echo "Deleting the existing release..."
  gh release delete $RELEASE_TAG_NAME -R $GH_REPOSITORY --cleanup-tag -y
else
  echo "No previous release found"
fi

echo "Deleting the associated tag..."
gh api \
  --method DELETE \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  /repos/$GH_REPOSITORY/git/refs/tags/$RELEASE_TAG_NAME >/dev/null 2>&1 || true

echo "Creating a new release with assets..."
gh release create $RELEASE_TAG_NAME -t $RELEASE_TAG_NAME --target $RELEASE_TARGET -R $GH_REPOSITORY release.tar.gz
