/**
 * Creates a new array with sorted elements of the original array, the sorted
 * array is in ascending order by default, unless providing a `compare` function
 * to determine how should the elements be ordered.
 * Unlike `Array.prototype.sort()`, this function always guarantees a stable
 * sort; and if all elements are numbers, they're sorted by their values instead
 * of converting to strings for sorting.
 */
export default function sort<T>(arr: T[], compare?: (a: T, b: T) => number): T[];
/**
 * Creates a new object with sorted keys (in ascending order) of the original
 * object, if `deep` is set, the children nodes will be sorted as well.
 * Note: symbol keys are not sorted and remain their original order.
 */
export default function sort<T extends object>(obj: T, deep?: boolean): T;
export default function sort(
    target: any | any[],
    method: ((a: any, b: any) => number) | boolean = void 0
) {
    if (Array.isArray(target)) {
        let compare = <(a: any, b: any) => number>method;

        // If the compare function is omitted and all the elements are numbers
        // (or of bigint), sort them by their values.
        if (!compare && (onlyNumbers(target) || onlyNumbers(target, "bigint"))) {
            compare = (a: number, b: number) => a - b;
        }

        if (shouldUseNativeSort(target)) {
            return [...target].sort(compare);
        }

        // Emulate stable sort.
        // Reference: http://blog.vjeux.com/2010/javascript/javascript-sorting-table.html
        return target
            .map((value, index) => ({ value, index }))
            .sort((a, b) => compare(a.value, b.value) || a.index - b.index)
            .map(({ value }) => value);
    } else if (target !== null && typeof target === "object") {
        let deep = Boolean(method);
        let keys = [
            ...sort(Object.getOwnPropertyNames(target)), // sort the keys
            ...Object.getOwnPropertySymbols(target)
        ];

        return keys.reduce((result, key) => {
            let value = target[key];

            if (deep && typeof value === "object" && value !== null) {
                if (Array.isArray(value)) {
                    value = value.map(item => sort(item, deep));
                } else {
                    value = sort(value, deep);
                }
            }

            result[key] = value;
            return result;
        }, {} as any);
    }
}

function onlyNumbers(arr: any[], type: "number" | "bigint" = "number") {
    return arr.every(ele => typeof ele === type);
}

function shouldUseNativeSort(arr: any[]) {
    if (typeof process?.versions === "object") {
        return arr.length <= 10
            || parseFloat(process.versions.v8 || "0") >= 7.0;
    } else if (typeof navigator?.userAgent === "string") {
        let match = navigator.userAgent.match(
            /(Chrome|Firefox|Safari|Edge|OPR)\/(\d+)/
        );

        if (match) {
            let name = match[1];
            let version = parseFloat(match[2]);

            if ((name === "Edge" && arr.length <= 512) ||
                (name === "Chrome" && (version >= 70) || arr.length <= 10) ||
                (name === "Firefox" && version >= 3) ||
                (name === "Safari" && version >= 10.1) ||
                (name === "OPR" && version >= 54)
            ) {
                return true;
            }
        }
    }

    return false;
}