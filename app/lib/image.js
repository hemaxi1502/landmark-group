/**
 * srcset steps for Hydrogen <Image>. The default (every 200px) drops the
 * top candidate when an upload is, say, 508px wide — the browser then gets
 * 400px. 50px steps keep (almost) the largest size the upload allows.
 */
export const IMAGE_SRCSET = {
  intervals: 40,
  startingWidth: 200,
  incrementSize: 50,
};
