module.exports = {
    "env": {
        "node": true
    },
    "plugins": [ ],
    "extends": "eslint:recommended",
    "rules": {
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": 0,
        "no-console": 0
    },
    "parserOptions": {
        "ecmaVersion": 6,
        "sourceType": "module",
        "ecmaFeatures": { }
    },
    "globals" : {
      "Promise" : true,
      "describe" : true,
      "it" : true,
      "context" : true,
      "beforeEach" : true,
      "afterEach" : true
    }
};
