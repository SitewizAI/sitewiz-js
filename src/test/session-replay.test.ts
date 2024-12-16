import { SessionReplay } from "../session-replay";
import { EventType } from "rrweb";

describe("SessionReplay", () => {
  let sessionReplay: SessionReplay;

  beforeEach(() => {
    // Use the getInstance method instead of the constructor
    sessionReplay = SessionReplay.getInstance(true);
    // Mock rrwebRecord
    sessionReplay.rrwebRecord = jest.fn();
  });

  describe("start_recording", () => {
    it("should mask all inputs and text when is_eu is true", () => {
      sessionReplay.start_recording(true);

      expect(sessionReplay.rrwebRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          maskAllInputs: true,
          maskTextSelector: "*",
          maskTextClass: "*",
          maskTextFn: expect.any(Function),
          maskInputOptions: {
            password: true,
            text: true,
            email: true,
            tel: true,
            search: true,
            url: true,
            color: true,
            date: true,
            "datetime-local": true,
            month: true,
            number: true,
            range: true,
            time: true,
            week: true,
            textarea: true,
            select: true,
          },
          blockClass: "rrweb-profile-img",
          blockSelector: 'img[src*="profile"], img[src*="avatar"]',
        })
      );

      // Test that the maskTextFn works correctly
      const options = sessionReplay.rrwebRecord.mock.calls[0][0];
      expect(options.maskTextFn("hello")).toBe("*****");
      expect(options.maskTextFn("test123")).toBe("*******");
    });

    it("should only mask password inputs when is_eu is false", () => {
      sessionReplay.start_recording(false);

      expect(sessionReplay.rrwebRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          maskAllInputs: false,
          maskInputOptions: {
            password: true,
          },
        })
      );

      // Should not have text or image masking options
      expect(sessionReplay.rrwebRecord).not.toHaveBeenCalledWith(
        expect.objectContaining({
          maskTextSelector: "*",
          maskTextClass: "*",
          maskTextFn: expect.any(Function),
          blockClass: expect.any(String),
          blockSelector: expect.any(String),
        })
      );
    });
  });
});
