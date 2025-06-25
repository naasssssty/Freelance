# Oracle Cloud Infrastructure (OCI) Deployment Guide

## Prerequisites

1. **Oracle Cloud Account**: Free Tier με $300 credit
2. **OCI CLI**: Για διαχείριση πόρων
3. **kubectl**: Για Kubernetes
4. **Terraform** (προαιρετικό): Για infrastructure as code

## Βήμα 1: Εγκατάσταση OCI CLI

```bash
# macOS
brew install oci-cli

# Linux/Ubuntu
bash -c "$(curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh)"

# Windows
# Download από: https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm
```

## Βήμα 2: Ρύθμιση OCI CLI

```bash
# Δημιουργία API Keys
oci setup config

# Θα σου ζητήσει:
# - User OCID (από OCI Console -> Profile -> User Settings)
# - Tenancy OCID (από OCI Console -> Profile -> Tenancy)
# - Region (π.χ. eu-frankfurt-1)
# - Key file location (default: ~/.oci/oci_api_key.pem)
```

## Βήμα 3: Δημιουργία Oracle Kubernetes Engine (OKE)

### Μέσω OCI Console:
1. **Πλοήγηση**: Menu → Developer Services → Kubernetes Clusters (OKE)
2. **Create Cluster**: 
   - Name: `freelance-cluster`
   - Kubernetes version: `v1.28` (latest stable)
   - Quick Create template
3. **Node Pool Configuration**:
   - Shape: `VM.Standard.E2.1.Micro` (Always Free)
   - Nodes: 2-3 nodes
   - OS: Oracle Linux 8

### Μέσω OCI CLI:
```bash
# Δημιουργία cluster
oci ce cluster create \
  --compartment-id <COMPARTMENT_OCID> \
  --name freelance-cluster \
  --vcn-id <VCN_OCID> \
  --kubernetes-version v1.28.2

# Δημιουργία node pool  
oci ce node-pool create \
  --cluster-id <CLUSTER_OCID> \
  --compartment-id <COMPARTMENT_OCID> \
  --name freelance-nodes \
  --node-shape VM.Standard.E2.1.Micro \
  --size 2
```

## Βήμα 4: Ρύθμιση kubectl για OKE

```bash
# Download cluster kubeconfig
oci ce cluster create-kubeconfig \
  --cluster-id <CLUSTER_OCID> \
  --file ~/.kube/config_oci \
  --region eu-frankfurt-1 \
  --token-version 2.0.0

# Merge με existing kubeconfig
export KUBECONFIG=~/.kube/config:~/.kube/config_oci
kubectl config view --flatten > ~/.kube/merged_config
mv ~/.kube/merged_config ~/.kube/config

# Αλλαγή context σε OCI
kubectl config use-context context-<CLUSTER_OCID>
kubectl config current-context
```

## Βήμα 5: Δημιουργία Container Registry

```bash
# Create namespace στο Oracle Container Registry (OCIR)
# Region: eu-frankfurt-1
# Namespace: freelance-app

# Login στο OCIR
docker login eu-frankfurt-1.ocir.io
# Username: <tenancy-namespace>/<username>
# Password: <auth-token>
```

## Βήμα 6: Ρύθμιση Persistent Storage

### Δημιουργία Storage Classes
```yaml
# oci-storage-class.yml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: oci-bv
provisioner: blockvolume.csi.oraclecloud.com
parameters:
  type: "paravirtualized"  # ή "iscsi"
allowVolumeExpansion: true
```

## Βήμα 7: Load Balancer Configuration

### Network Security Lists
1. **Ingress Rules** (από Internet):
   - Source: 0.0.0.0/0
   - Protocol: TCP
   - Destination Port: 80, 443

2. **Egress Rules** (προς Internet):
   - Destination: 0.0.0.0/0
   - Protocol: All

## Βήμα 8: Deploy Application

```bash
# Apply Kubernetes manifests
kubectl apply -f kubernetes/

# Check deployment status
kubectl get pods -n freelance
kubectl get svc -n freelance
kubectl get ingress -n freelance
```

## Βήμα 9: SSL/TLS με Let's Encrypt

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Configure ClusterIssuer για Let's Encrypt
kubectl apply -f oracle-cloud/cert-issuer.yml
```

## Βήμα 10: Monitoring & Logging

```bash
# Deploy Oracle Cloud Infrastructure Monitoring
kubectl apply -f oracle-cloud/monitoring/

# Configure log collection
kubectl apply -f oracle-cloud/logging/
```

## Always Free Tier Limits

### Compute
- **2 AMD-based Compute VMs**: VM.Standard.E2.1.Micro (1 OCPU, 1 GB RAM)
- **4 Arm-based Ampere A1 Compute**: 3,000 OCPU hours, 18,000 GB hours per month

### Storage
- **Block Volume**: 200 GB total
- **Object Storage**: 20 GB
- **Archive Storage**: 20 GB

### Networking
- **Load Balancer**: 1 instance, 10 Mbps
- **Data Transfer**: 10 TB per month

## Cost Optimization Tips

1. **Use Always Free resources**: VM.Standard.E2.1.Micro instances
2. **Monitor usage**: OCI Console → Billing & Cost Management  
3. **Set budget alerts**: Notification όταν πλησιάζεις το όριο
4. **Auto-scaling**: Μόνο όταν χρειάζεται

## Troubleshooting

### Common Issues

1. **OKE Node Issues**:
```bash
kubectl get nodes
kubectl describe node <node-name>
```

2. **Pod Scheduling Issues**:
```bash
kubectl describe pod <pod-name> -n freelance
kubectl get events -n freelance --sort-by='.lastTimestamp'
```

3. **Network Connectivity**:
```bash
# Check security lists
oci network security-list list --compartment-id <COMPARTMENT_OCID>

# Test connectivity
kubectl run test-pod --image=busybox --rm -it -- /bin/sh
```

## Security Best Practices

1. **Identity and Access Management (IAM)**:
   - Create specific policies για OKE
   - Use service accounts
   - Enable MFA

2. **Network Security**:
   - Private subnets για worker nodes
   - Security lists με least privilege
   - Network Security Groups (NSGs)

3. **Container Security**:
   - Scan images με OCI Vulnerability Scanning
   - Use Oracle Linux container images
   - Enable Pod Security Standards

## Monitoring and Alerts

```bash
# Install Oracle Cloud Infrastructure metrics server
kubectl apply -f oracle-cloud/oci-metrics-server.yml

# Configure alerts
oci monitoring alarm create \
  --compartment-id <COMPARTMENT_OCID> \
  --display-name "High CPU Usage" \
  --metric-compartment-id <COMPARTMENT_OCID> \
  --namespace "oci_computeagent" \
  --query "CPUUtilization[1m].mean() > 80"
```

## Next Steps

1. **Production Setup**: Use paid instances για production
2. **CI/CD Integration**: Connect Jenkins με OCI
3. **Database Migration**: Use Oracle Autonomous Database
4. **CDN Setup**: Oracle Cloud CDN για static assets
5. **Backup Strategy**: OCI Object Storage για backups 