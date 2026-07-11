import { userEvent } from "@testing-library/user-event";

/** Builds a `File` for feeding into `<input type="file">` in tests. */
export function createTestFile(
  name = "avatar.png",
  content = "test-file-content",
  type = "image/png",
) {
  return new File([content], name, { type });
}

/** Uploads one or more files through Testing Library's user-event. */
export async function mockFileUpload(input: HTMLElement, files: File[]) {
  const user = userEvent.setup();
  await user.upload(input, files);
}
