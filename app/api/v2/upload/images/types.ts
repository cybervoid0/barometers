export type FileProps = { fileName: string; contentType: string }
export type FileDto = { files: FileProps[] }
export type UrlProps = { signed: string; public: string }
export type UrlDto = { urls: UrlProps[] }
