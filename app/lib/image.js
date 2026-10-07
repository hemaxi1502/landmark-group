/**
 * srcset steps for Hydrogen <Image>. The default (every 200px) drops the
 * top candidate when an upload is, say, 508px wide — the browser then gets
 * 400px. 100px steps keep the largest size the upload allows.
 */
export const IMAGE_SRCSET = {
  intervals: 30,
  startingWidth: 100,
  incrementSize: 100,
};
