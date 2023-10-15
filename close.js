import { Octokit } from "octokit"
import { RateLimiter } from "limiter-es6-compat"

const limiter = new RateLimiter({ tokensPerInterval: 1, interval: 20000 })
const githubToken = "GITHUB_PERSONAL_TOKEN"
const githubRepo = "GITHUB_REPO"
const githubUser = "GITHUB_USERNAME"

const git = new Octokit({ auth: githubToken })
const maxIssueId = 1105
try {
	for (let id=6; id < maxIssueId; id++) {
		const remainingMessages = await limiter.removeTokens(1)
		const gitIssuesUrl = `/repos/${githubUser}/${githubRepo}/issues/${id}`
		console.log(`Updating issue ${id} - closed`)

		await git.request(`POST ${gitIssuesUrl}`, {
			owner: githubUser,
			repo: githubRepo,
			state: 'closed',
			headers: {"X-GitHub-Api-Version": "2022-11-28"}
		})
	}
} catch (e) {
	console.error(e.message)
}
