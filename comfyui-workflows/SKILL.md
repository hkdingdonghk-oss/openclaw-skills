# ComfyUI Workflows

Quick-start workflows for common image/video tasks in ComfyUI.

## Virtual Try-On (Person + Cloth)

### Workflow Structure
```
LoadImage (person) ──────────┐
                              ├──► VAEEncodeForInpaint ──► KSampler ──► VAEDecode ──► SaveImage
LoadImage (cloth) ─► ImageColorToMask ──► ImageScale ──┘
                                                        ▲
Checkpoint ──► CLIPTextEncode (pos) ────────────────────┤
Checkpoint ──► CLIPTextEncode (neg) ────────────────────┘
```

### Node Settings
| Node | Setting | Value |
|------|---------|-------|
| ImageColorToMask | channel | red/green/blue (pick clothing color) |
| ImageScale | width/height | 512x768 |
| VAEEncodeForInpaint | grow_mask_by | 6 |
| KSampler | seed | 42 |
| KSampler | steps | 25 |
| KSampler | cfg | 7 |
| KSampler | denoise | 0.7-0.85 |

### Prompts
**Positive:**
```
high quality fashion photo, beautiful person wearing the cloth, detailed, professional photography
```

**Negative:**
```
ugly, blurry, low quality, distorted face, bad anatomy, deformed
```

### Tips
- Lower denoise (0.5-0.6) = keep original more
- Higher denoise (0.85) = blend more with cloth
- ImageColorToMask channel = the color that becomes white (the clothing)

---

## Quick Image Generation

```python
# API Workflow (prompt format)
{
  "prompt": {
    "1": {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": "sd15.safetensors"}},
    "2": {"class_type": "CLIPTextEncode", "inputs": {"text": "YOUR PROMPT", "clip": ["1", 1]}},
    "3": {"class_type": "CLIPTextEncode", "inputs": {"text": "ugly, blurry", "clip": ["1", 1]}},
    "4": {"class_type": "EmptyLatentImage", "inputs": {"width": 512, "height": 512, "batch_size": 1, "seed": 42}},
    "5": {"class_type": "KSampler", "inputs": {"seed": 42, "steps": 20, "cfg": 7, "sampler_name": "euler_ancestral", "denoise": 1, "model": ["1", 0], "positive": ["2", 0], "negative": ["3", 0], "latent_image": ["4", 0]}},
    "6": {"class_type": "VAEDecode", "inputs": {"samples": ["5", 0], "vae": ["1", 2]}},
    "7": {"class_type": "SaveImage", "inputs": {"images": ["6", 0], "filename_prefix": "output"}}
  }
}
```

---

## ComfyUI API Basics

### Start Server
```bash
source ~/miniconda3/bin/activate ai_env
cd ~/ComfyUI
python main.py --listen 0.0.0.0 --port 8188
```

### Queue Prompt
```bash
curl -X POST http://127.0.0.1:8188/prompt \
  -H "Content-Type: application/json" \
  -d @workflow.json
```

### Check Status
```bash
curl http://127.0.0.1:8188/queue
```

### Get History
```bash
curl http://127.0.0.1:8188/history
```

---

## Useful Nodes

| Node | Purpose |
|------|---------|
| LoadImage | Load image from input folder |
| SaveImage | Save to output folder |
| CheckpointLoaderSimple | Load SD checkpoint |
| CLIPTextEncode | Encode text prompt |
| KSampler | Sampling |
| VAEEncode / VAEDecode | Encode/decode latent |
| VAEEncodeForInpaint | Inpainting prep |
| ImageScale | Resize image |
| ImageColorToMask | Create mask from color |
| ImageCompositeMasked | Blend images with mask |
| ControlNetApply | Apply ControlNet |

---

## VRAM Management

RTX 2080 Ti = 22GB VRAM

| Task | Approx VRAM |
|------|-------------|
| SD15 generation | 4-6GB |
| SDXL generation | 8-12GB |
| Video (Hunyuan) | 6-8GB |
| Video (Mochi) | 8-10GB |
