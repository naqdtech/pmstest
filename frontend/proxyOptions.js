// The dev proxy targets the bench webserver. common_site_config.json only
// exists inside a bench, so we resolve it defensively — `vite build` (which
// also loads this config) then works outside a bench too; the proxy itself is
// only ever used by `vite dev`.
let webserver_port = 8000;
try {
	webserver_port = require("../../../sites/common_site_config.json").webserver_port || 8000;
} catch (e) {
	// not running inside a bench (e.g. CI / standalone build)
}

export default {
	"^/(app|api|assets|files|private)": {
		target: `http://127.0.0.1:${webserver_port}`,
		ws: true,
		router: function (req) {
			const site_name = req.headers.host.split(":")[0];
			return `http://${site_name}:${webserver_port}`;
		},
	},
};
