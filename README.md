# Cauldron

[![Build](https://github.com/noatgnu/cauldron/actions/workflows/ci-build-check.yml/badge.svg)](https://github.com/noatgnu/cauldron/actions/workflows/ci-build-check.yml)


## Acquiring the Software
### Windows

To acquire the software, follow these steps:

1. **Download the Main Archive**:
  - Go to the [GitHub Release page](https://github.com/noatgnu/cauldron/releases) of the repository.
  - Download the archive `cauldron-<version>-win-no-extra.tar.gz`.

2. **Extract the Main Archive**:
  - Extract the contents of `cauldron-<version>-win-no-extra.tar.gz` to your desired location.
  - Run the executable `cauldron.exe` to start the program.

3. **(Optional) Download and Extract Python and R Environments**:
  - If you are using Windows, you can download the additional archives for Python and R environments:
    - `python-win-extra.tar.gz`
    - `r-portable-win-extra.tar.gz`
  - Extract these archives into the main program location where you extracted `cauldron-<version>-win-no-extra.tar.gz`.

By following these steps, you will have the main program along with the necessary Python and R environments with all required packages installed.

## Windows Manual Development Setup

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 16 or higher)
- **npm** (Node Package Manager)
- **Python** (version 3.10)
- **R** (version 4.2.0 or higher)

### Setting Up Python

1. **Download and Install Python 3.10**:
  - Download the standalone Python build from [here](https://github.com/indygreg/python-build-standalone/releases/download/20240107/cpython-3.10.13+20240107-x86_64-pc-windows-msvc-shared-install_only.tar.gz).
  - By default, you can install under `app/bin/win/python`

2. **Add Python to PATH**:
  - Add the extracted Python directory to your system's PATH environment variable.
  - If not, in the following step replace `python` with the full path to the Python executable.

3. **Install Required Python Packages**:
  - Navigate to the project directory and run:
    ```sh
    python -m pip install -r app/requirements.txt
    ```

### Setting Up R

1. **Download and Install R**:
  - Download R from the [CRAN website](https://cran.r-project.org/mirrors.html) and follow the installation instructions for your operating system.

2. **Install Required R Packages**:
  - In the command line run:
    ```sh
    Rscript app/scripts/install_packages.R
    ```
