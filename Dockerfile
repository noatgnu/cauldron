# docker build -t cauldron-builder .
# docker run --rm -v .\release:/app/release cauldron-builder
FROM electronuserland/builder:wine

ADD . /app
WORKDIR /app
RUN npm install
# download distributable python 3.10.13
RUN wget https://github.com/indygreg/python-build-standalone/releases/download/20240107/cpython-3.10.13+20240107-x86_64-pc-windows-msvc-shared-install_only.tar.gz
RUN wget https://github.com/indygreg/python-build-standalone/releases/download/20240107/cpython-3.10.13+20240107-aarch64-apple-darwin-install_only.tar.gz
RUN wget https://github.com/indygreg/python-build-standalone/releases/download/20240107/cpython-3.10.13+20240107-x86_64-unknown-linux-gnu-install_only.tar.gz

# extract python to /app/app/bin/win32/python
RUN mkdir -p app/bin/win/python
RUN tar -xzf cpython-3.10.13+20240107-x86_64-pc-windows-msvc-shared-install_only.tar.gz -C app/bin/win/python
# extract python to /app/app/bin/darwin/python
RUN mkdir -p app/bin/darwin/python
RUN tar -xzf cpython-3.10.13+20240107-aarch64-apple-darwin-install_only.tar.gz -C app/bin/darwin/python
# extract python to /app/app/bin/linux/python
RUN mkdir -p app/bin/linux/python
RUN tar -xzf cpython-3.10.13+20240107-x86_64-unknown-linux-gnu-install_only.tar.gz -C app/bin/linux/python

# remove python tarball
RUN rm cpython-3.10.13+20240107-x86_64-pc-windows-msvc-shared-install_only.tar.gz
RUN rm cpython-3.10.13+20240107-aarch64-apple-darwin-install_only.tar.gz
RUN rm cpython-3.10.13+20240107-x86_64-unknown-linux-gnu-install_only.tar.gz

# build electron app

ENTRYPOINT ["npm", "run", "electron:build"]
