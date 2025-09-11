const plugin = require("tailwindcss/plugin");

const darkModePlugin = plugin(function ({addVariant, e}) {
	addVariant("dark", ({container, separator}) => {
		container.walkRules((rule) => {
			rule.selector = `.dark ${rule.selector.replace(/\s*&/, "")}`;
		});
	});
});

module.exports = darkModePlugin;
