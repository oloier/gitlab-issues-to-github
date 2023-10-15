import { parse } from "csv-parse"
import * as fs from "fs"
import { Octokit } from "octokit"
import { RateLimiter } from "limiter-es6-compat"

const limiter = new RateLimiter({ tokensPerInterval: 1, interval: 20000 });
const githubToken = "GITHUB_PERSONAL_TOKEN"
const githubRepo = "GITHUB_REPO"
const githubUser = "GITHUB_USERNAME"
const csvFile = "path_to_file.csv"

const readStream = fs.createReadStream(csvFile)
const parser = parse({ delimiter: ",", columns: true })

const git = new Octokit({ auth: githubToken })
const gitIssuesUrl = `/repos/${githubUser}/${githubRepo}/issues`

try {
	readStream.pipe(parser).on("data", async (row) => {
		const remainingMessages = await limiter.removeTokens(1)
		let description = `Original Date: ${row["Created At (UTC)"]}\n\n${row.Description}`

		console.log(`Importing issue '${row.Title}'`)
		await git.request(`POST ${gitIssuesUrl}`, {
			owner: githubUser,
			repo: githubRepo,
			title: row.Title,
			body: description,
			assignees: [githubUser],
			labels: ["legacy"],
			headers: {"X-GitHub-Api-Version": "2022-11-28"}
		})
	})
} catch (e) {
	console.error(e.message)
}
