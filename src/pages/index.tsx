import { NextPageContext } from "next";

Page.getInitialProps = async (ctx: NextPageContext) => {
  if (!ctx.req) return {};
  const data = ctx.req.headers["x-data"];
  if (!data) return {};
  delete ctx.req.headers["x-data"];
  return data;
};

export default function Page(data: any) {
  return <div>{JSON.stringify(data)}</div>;
}
