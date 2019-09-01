module.exports = {
	"roots": [
		"<rootDir>/src"
	],
	transform: {
		"^.+\\.tsx?$": "ts-jest"
	},
	verbose: true,
	collectCoverage: true,
	coverageReporters: ["text-summary"]
}
