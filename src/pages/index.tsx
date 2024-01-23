import { NextPageContext } from "next";

Page.getInitialProps = async (ctx: NextPageContext) => {
  if (!ctx.res) return {};
  const data = ctx.res.getHeader("X-data");
  if (!data) return {};
  ctx.res!.removeHeader("X-data");
  return JSON.parse(data as string);
};

export default function Page(data: any) {
  return <div>{JSON.stringify(data)}</div>;
}
