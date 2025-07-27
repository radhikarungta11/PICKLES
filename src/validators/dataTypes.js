const ID_LEN = 24;

function checkAndParse({ mandatoryArgs, optionalArgs }) {
    const data = {};
    let collection = null;

    if (mandatoryArgs) {
        collection = mandatoryArgs.strings;
        for (key in collection) {
            const value = collection[key];
            if (!value) return;
            data[key] = value;
        }

        collection = mandatoryArgs.numbers;
        for (key in collection) {
            const value = parseInt(collection[key]);
            if (!value) return;
            data[key] = value;
        }

        collection = mandatoryArgs.ids;
        for (key in collection) {
            const value = collection[key];
            if (value.length !== ID_LEN) return;
            data[key] = value;
        }

        collection = mandatoryArgs.booleans;
        for (key in collection) {
            const value = collection[key];
            if (value === 'true') data[key] = true;
            else if (value === 'false') data[key] = false;
            else return;
        }
    }

    if (optionalArgs) {
        collection = optionalArgs.strings;
        for (key in collection) {
            const value = collection[key];
            if (!value) continue;
            data[key] = value;
        }

        collection = optionalArgs.numbers;
        for (key in collection) {
            let value = collection[key];
            if (!value) continue;
            value = parseInt(value);
            if (!value) return;
            data[key] = value;
        }

        collection = mandatoryArgs.booleans;
        for (key in collection) {
            const value = collection[key];
            if (value === 'true') data[key] = true;
            else if (value === 'false') data[key] = false;
            else continue;
        }
    }

    return data;
}

module.exports = { checkAndParse };
