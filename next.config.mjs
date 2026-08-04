import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer, webpack }) => {
    // pptxgenjs references Node built-ins (fs, https, ...) even though it also
    // runs fine in the browser — stub them out for the client bundle.
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        https: false,
        http: false,
        path: false,
        stream: false,
        zlib: false,
        os: false,
        crypto: false,
      };
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
          resource.request = resource.request.replace(/^node:/, "");
        })
      );
    }
    return config;
  },
};

initOpenNextCloudflareForDev();

export default nextConfig;
