import { k8sCoreV1Api } from "./config.js";

export async function createPod(sandboxId) {
    const podManifest = {
        metadata: {
            name: `sandbox-${sandboxId}`,
            labels: {
                app: "sandbox-instance",
                sandboxId: sandboxId
            }
        },
        spec: {
            volumes:[
                {
                    name:"workspace-volume",
                    emptyDir:{}
                }
            ],
            initContainers: [
                {
                    name:"init-container",
                    image: process.env.TEMPLATE_IMAGE || "template:latest",
                    imagePullPolicy:"IfNotPresent",
                    command:["sh","-c","cp -r /workspace/. /seed/"],
                    volumeMounts: [
                        {
                            name: 'workspace-volume',
                            mountPath:'/seed'
                        }
                    ]
                }
            ],
            containers: [
            {
                    image: process.env.TEMPLATE_IMAGE || "template:latest",
                    imagePullPolicy: "IfNotPresent",
                    name: "sandbox-container",
                    ports: [{containerPort: 5173, name: "preview-http"}],
                    resources: {
                    limits: {cpu: "500m",memory: "1Gi",},
                    requests: { cpu: "250m", memory:"500Mi"}
                    },
                    volumeMounts:[
                        {
                            name:"workspace-volume",
                            mountPath:"/workspace"
                        }
                    ]
            },
            {
                image: process.env.AGENT_IMAGE || "agent:latest",
                imagePullPolicy: "IfNotPresent",
                name: "agent-container",
                ports: [{containerPort: 3000, name: "agent-http"}],
                resources: {
                    limits: {cpu: "500m",memory: "1Gi",},
                    requests: { cpu: "250m", memory:"500Mi"}
                },
                volumeMounts:[
                        {
                            name:"workspace-volume",
                            mountPath:"/workspace"
                        }
                    ]

            }

            ]

        }
    }
    const response=await k8sCoreV1Api.createNamespacedPod({ namespace: "default", body: podManifest })
    return response
}