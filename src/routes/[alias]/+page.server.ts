export async function load({ params, locals }) {
  const fileInfo = locals.stmts.getFileInfo.get(params.alias);
  if (!fileInfo) {
    throw new Error("alias doesn't exist");
  }
}