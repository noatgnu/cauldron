options(repos = c(CRAN = "https://cloud.r-project.org/"))

# Install BiocManager if not already installed
if (!requireNamespace("BiocManager", quietly = TRUE)) {
  install.packages("BiocManager")
}

# Read the package list
packages <- read.table("app/r_requirements.txt", stringsAsFactors = FALSE)

# Install each package using BiocManager
for (i in 1:nrow(packages)) {
  if (packages[i, 1] == "BiocManager") {
    next
  }
  package <- packages[i, 1]
  version <- packages[i, 2]
  if (!require(package, character.only = TRUE)) {
      tryCatch(
        {
          BiocManager::install(package, version = version, dependencies = TRUE)
        },
        error = function(e) {
          install.packages(package, version = version, dependencies = TRUE)
        }
      )
    }
}
