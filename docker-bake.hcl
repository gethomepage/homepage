target "docker-metadata-action" {}

target "homepage" {
  inherits = ["docker-metadata-action"]
  dockerfile = "Dockerfile"
  platforms = ["linux/amd64", "linux/arm64"]
  output = ["type=registry"]
  cache-from = ["type=local,src=/tmp/.buildx-cache"]
  cache-to = ["type=local,dest=/tmp/.buildx-cache-new,mode=max"]
  args = {
    CI = "true"
  }
}
