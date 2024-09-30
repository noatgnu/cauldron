options(repos = c(CRAN = "https://cloud.r-project.org/"))
packages <- read.table("app/r_requirements.txt", stringsAsFactors = FALSE)
for (i in 1:nrow(packages)) {
  package <- packages[i, 1]
  version <- packages[i, 2]
  if (!require(package, character.only = TRUE)) {
    install.packages(package, dependencies = TRUE)
  }
}
