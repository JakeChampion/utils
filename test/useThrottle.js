/* global describe, it */
const assert = require("assert");
const { useThrottle, sleep } = require("..");

describe("useThrottle", () => {
    after(() => {
        clearInterval(useThrottle.gcTimer);
    });

    it("should create a throttle function and runs the handle function only once", async () => {
        let count = 0;
        let getFullName = useThrottle("getFullName", 100);
        let result = await Promise.all(
            new Array(10).fill(void 0).map(_ => getFullName((firstName, lastName) => {
                count++;
                return firstName + " " + lastName;
            }, "Ayon", "Lee"))
        );

        assert.deepStrictEqual(result, new Array(10).fill("Ayon Lee"));
        assert.strictEqual(count, 1);
    });

    it("should create a throttle function and runs the handle function many times", async () => {
        let count = 0;
        let getFullName = useThrottle("getFullName2", 100);
        let result = [];

        for (let i = 0; i < 10; i++) {
            result.push(await getFullName(async (firstName, lastName) => {
                count++;
                return firstName + " " + lastName;
            }, "Ayon", "Lee"));
            await sleep(101); // set +1 to ensure the previous job is finished
        }

        assert.deepStrictEqual(result, new Array(10).fill("Ayon Lee"));
        assert.strictEqual(count, 10);
    });

    it("should throw the same error if calls multiple times of a throttle function within the interval", async () => {
        let count = 0;
        let throwError = useThrottle("throwError", 100);
        let result = [];

        for (let i = 0; i < 2; i++) {
            try {
                await throwError(async () => {
                    count++;
                    throw new Error("Something went wrong");
                });
            } catch (e) {
                result.push(e);
            }
        }

        assert.strictEqual(count, 1);
        assert.strictEqual(result.length, 2);
        assert(result[0] === result[1]);
    });
});