export default timestamp;

/** Returns the current UNIX timestamp. */
function timestamp(ms?: boolean): number;
/**
 * Returns the UNIX timestamp according the input date or time.
 * NOTE: if the input value is a number, it must be of milliseconds.
 */
function timestamp(input: string | number | Date, ms?: boolean): number;
function timestamp(input: any, ms = false) {
    if (typeof input === "boolean") {
        ms = input;
        input = void 0;
    }

    input = input || new Date();

    if (input instanceof Date) {
        return ms ? input.valueOf() : Math.floor(input.valueOf() / 1000);
    } else if (typeof input === "number") {
        return ms ? input : Math.floor(input / 1000);
    } else {
        let date: Date;
        let dateTime = String(input).trim();

        if (/^\d{1,2}:\d{2}(:\d{2})?/.test(dateTime)) {
            date = new Date();
            dateTime = date.getFullYear()
                + "-" + (date.getMonth() + 1)
                + "-" + date.getDate()
                + " " + dateTime;
        }

        date = new Date(dateTime);

        if (String(date) !== "Invalid Date") {
            return ms ? date.valueOf() : Math.floor(date.valueOf() / 1000);
        } else {
            throw new Error("The input argument is not a valid date-time string");
        }
    }
}