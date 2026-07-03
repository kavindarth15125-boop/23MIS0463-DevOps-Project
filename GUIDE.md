# DevOps Assignment 2 — Step-by-Step Completion Guide
## Chosen Scenario: Use Case 4 — Company Intranet Portal

This guide walks you through every stage: Git/GitHub → Jenkins CI/CD → Docker →
Kubernetes → Nagios → Graphite → Grafana → final documentation.

Take a **screenshot at the end of every step marked 📸** — you'll need these for
your report.

---

## 0. Prerequisites (install once)

Install these on your machine (Windows/Linux/Mac all fine):

| Tool | Purpose | Install |
|---|---|---|
| Git | Version control | https://git-scm.com/downloads |
| Docker Desktop | Containers + built-in single-node Kubernetes | https://www.docker.com/products/docker-desktop |
| Jenkins | CI/CD automation | https://www.jenkins.io/download (or `docker run -p 8080:8080 -p 50000:50000 jenkins/jenkins:lts`) |
| kubectl | Kubernetes CLI (comes with Docker Desktop's K8s) | included |
| Nagios Core | Uptime/service monitoring | https://www.nagios.org/downloads/ (Linux/WSL recommended) |
| Graphite | Metrics storage | easiest via Docker: `docker run -d --name graphite -p 8080:80 -p 2003-2004:2003-2004 graphiteapp/graphite-statsd` |
| Grafana | Dashboards | `docker run -d --name grafana -p 3000:3000 grafana/grafana` |

If Docker Desktop's Kubernetes is unavailable, use **minikube** instead
(`minikube start`) — the `kubectl` commands below work identically.

---

## Step 1 — Project files (already prepared for you)

I've built the starter project for you in this conversation:
- `site/` — HTML/CSS/JS intranet portal (Home news, HR policies, holiday calendar, announcements)
- `Dockerfile` — containerizes the site with nginx
- `Jenkinsfile` — CI/CD pipeline definition
- `k8s/deployment.yaml`, `k8s/service.yaml` — Kubernetes manifests
- `nagios/intranet-portal.cfg` — sample Nagios monitoring config

Download the ZIP I'll provide, unzip it, and open the folder locally.

---

## Step 2 — Push to GitHub 📸

```bash
cd intranet-portal-project
git init
git add .
git commit -m "Initial commit: intranet portal project"
git branch -M main
git remote add origin https://github.com/<yourusername>/<RegisterNumber>-DevOps-Project.git
git push -u origin main
```
- Create the empty repo on GitHub first (github.com → New Repository), named
  `RegisterNumber-DevOps-Project` per the naming convention.
- 📸 Screenshot the GitHub repo page showing your files.
- Copy the repo URL — this is Mandatory Link #1 for your report.

---

## Step 3 — Set up Jenkins and run the pipeline 📸

1. Start Jenkins (`http://localhost:8080`), finish the setup wizard, install
   suggested plugins, plus the **Docker Pipeline** and **Git** plugins.
2. Dashboard → **New Item** → name it `intranet-portal-pipeline` → type
   **Pipeline** → OK.
3. In the job config, scroll to **Pipeline** → Definition: "Pipeline script
   from SCM" → SCM: Git → paste your GitHub repo URL → Script Path:
   `Jenkinsfile`.
4. Edit the `Jenkinsfile` I gave you: replace the `git url` with your actual
   repo URL, and (if you don't want Docker Hub push) delete the "Push to
   Docker Hub" stage.
5. Click **Build Now**.
6. 📸 Screenshot: Jenkins Dashboard, this Job's Configuration page, and the
   **Console Output** of a successful build (green ✔).

If Jenkins isn't reachable outside your machine, these three screenshots
substitute for the "Jenkins Build URL" requirement.

---

## Step 4 — Build and run the Docker container manually (for screenshots) 📸

Even though Jenkins builds it automatically, also run this manually once so
you have clean standalone screenshots:

```bash
cd intranet-portal-project
docker build -t intranet-portal:latest .
docker run -d -p 8081:80 --name intranet-portal-test intranet-portal:latest
docker ps
```
- 📸 Screenshot `docker ps` showing the running container.
- Open `http://localhost:8081` in your browser.
- 📸 Screenshot the site rendering.

**(Optional) Push to Docker Hub:**
```bash
docker login
docker tag intranet-portal:latest <dockerhubuser>/intranet-portal:latest
docker push <dockerhubuser>/intranet-portal:latest
```
Copy the Docker Hub repo URL — Mandatory Link #3 (optional).

Once you've confirmed it works, stop the test container so it doesn't clash
with Kubernetes' NodePort later:
```bash
docker stop intranet-portal-test && docker rm intranet-portal-test
```

---

## Step 5 — Deploy to Kubernetes 📸

```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl get pods
kubectl get deployments
kubectl get services
```
- 📸 Screenshot all three `kubectl get` outputs showing Running pods and the
  NodePort service.
- Visit `http://localhost:30080` (Docker Desktop K8s) or
  `http://$(minikube ip):30080` (minikube).
- 📸 Screenshot the site loading via Kubernetes.

This URL is Mandatory Link #4 (Application URL). If it's only reachable
locally, the screenshot substitutes for the link.

---

## Step 6 — Configure Nagios monitoring 📸

1. Install Nagios Core (Linux/WSL is easiest — follow the official quickstart
   guide for your distro).
2. Copy `nagios/intranet-portal.cfg` into
   `/usr/local/nagios/etc/objects/intranet-portal.cfg`.
3. Edit `/usr/local/nagios/etc/nagios.cfg` and add:
   ```
   cfg_file=/usr/local/nagios/etc/objects/intranet-portal.cfg
   ```
4. Set `address` in the cfg to your Docker/Kubernetes host IP (use
   `127.0.0.1` if Nagios runs on the same machine).
5. Verify config and restart:
   ```bash
   sudo /usr/local/nagios/bin/nagios -v /usr/local/nagios/etc/nagios.cfg
   sudo systemctl restart nagios
   ```
6. Open the Nagios web UI (`http://localhost/nagios`) → **Services**.
- 📸 Screenshot showing `intranet-portal-host` as **UP** and the **HTTP**
  service as **OK**.

---

## Step 7 — Send metrics to Graphite 📸

The simplest path for a static nginx site is to feed basic system/container
metrics using **statsd** (bundled in the `graphiteapp/graphite-statsd` image)
or Docker's built-in stats:

```bash
# quick demo: push a sample metric into Graphite manually
echo "intranet.portal.uptime 1 $(date +%s)" | nc -q0 localhost 2003
```

For a more realistic feed, install `collectd` or `telegraf` on the host and
point its Graphite output plugin at `localhost:2003`. Either approach is
acceptable for this assignment — the goal is showing metrics arriving.

1. Open the Graphite web UI: `http://localhost:8080`.
2. Navigate the metrics tree (Metrics → intranet → portal) and open a graph.
- 📸 Screenshot Graphite showing at least one received metric on a graph.

---

## Step 8 — Build a Grafana dashboard 📸

1. Open Grafana: `http://localhost:3000` (default login admin/admin).
2. **Connections → Data Sources → Add data source → Graphite** → set URL to
   `http://localhost:8080` (or `http://graphite:80` if both run in the same
   Docker network) → Save & Test.
3. **Dashboards → New Dashboard → Add visualization** → select the Graphite
   data source → query your metric (e.g. `intranet.portal.uptime`) or use the
   built-in Docker/host CPU & memory metrics if you also installed
   `telegraf`/`collectd`.
4. Add panels for whatever system health metrics you collected (CPU, Memory,
   Uptime at minimum, per the use case's "system health" requirement).
5. Save the dashboard as "Intranet Portal Monitoring".
- 📸 Screenshot the completed Grafana dashboard.

---

## Step 9 — Write the Documentation Report

Create a Word or PDF report (`RegisterNumber_Name_DevOps_Report.pdf/docx`)
with these sections, in this order:

1. **Mandatory Links** (first page, as a table):
   - GitHub Repository Link
   - Jenkins Build URL / screenshots
   - Docker Hub Repository Link (if used)
   - Application URL / local URL + screenshot
   - Grafana Dashboard screenshot
   - Nagios Monitoring screenshot
   - Graphite Metrics screenshot
2. **Introduction** — restate the use case (Company Intranet Portal) and
   objectives.
3. **Architecture Diagram** — simple flow: Developer → GitHub → Jenkins →
   Docker Image → Kubernetes → Nagios/Graphite/Grafana monitoring. (I can
   generate this diagram for you if you'd like — just ask.)
4. **Step-by-step implementation** — one subsection per step above, each with
   its screenshots and a short explanation of what you did.
5. **Final Submission Checklist** — copy the checklist from the assignment
   PDF and tick every box.
6. **Conclusion** — summarize what was achieved and any challenges faced.

I can generate this as a formatted Word document once you've collected your
screenshots — just tell me and share the screenshots.

---

## Step 10 — Package everything for submission

```bash
zip -r RegisterNumber_Name_DevOps_Project.zip intranet-portal-project/
```
Rename your report to `RegisterNumber_Name_DevOps_Report.pdf` (or `.docx`).

Final checklist before upload:
- [ ] GitHub repo accessible, all code pushed
- [ ] Jenkins build succeeded (screenshots taken)
- [ ] Docker image built and container ran
- [ ] Kubernetes Pods + Service Running
- [ ] Site accessible in browser
- [ ] Nagios shows Host UP / Service OK
- [ ] Graphite receiving metrics
- [ ] Grafana dashboard shows metrics
- [ ] Report has screenshots for every step
- [ ] All mandatory links included on page 1
