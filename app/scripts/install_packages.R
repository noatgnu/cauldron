options(repos = c(CRAN = "https://cloud.r-project.org/"))
print("Installing R packages...")
print(.libPaths())
# Install BiocManager if not already installed
if (!requireNamespace("BiocManager", quietly = TRUE)) {
  install.packages("BiocManager")
}

# Read the package list
packages <- read.table("app/r_requirements.txt", stringsAsFactors = FALSE)

# Attempt to install all packages using BiocManager
for (i in 1:nrow(packages)) {
  package <- packages[i, 1]
  version <- packages[i, 2]
  if (!require(package, character.only = TRUE)) {
    tryCatch(
      {
        message(paste("Installing", package, "version", version, "using BiocManager"))
        BiocManager::install(package, dependencies = TRUE)
      },
      error = function(e) {
        message(paste("Failed to install", package, "using BiocManager:", e$message))
      }
    )
  }
}

# Check which packages are still not installed
not_installed <- c()
for (i in 1:nrow(packages)) {
  package <- packages[i, 1]
  if (!require(package, character.only = TRUE)) {
    not_installed <- c(not_installed, package)
  }
}

# Attempt to install the remaining packages using install.packages
for (package in not_installed) {
  tryCatch(
    {
      message(paste("Attempting to install", package, "using install.packages"))
      install.packages(package, dependencies = TRUE)
    },
    error = function(e) {
      message(paste("Failed to install", package, "using install.packages:", e$message))
    }
  )
}
