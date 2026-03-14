# ComfyUI Setup (2026-03-14)

## When to Use
- Setting up ComfyUI from scratch
- Upgrading ComfyUI version

## Steps

1. **Environment**
   ```bash
   source ~/miniconda3/bin/activate ai_env
   cd ~/ComfyUI
   ```

2. **Start Server**
   ```bash
   python main.py --listen 0.0.0.0 --port 8188
   ```

3. **Install Custom Nodes**
   - ComfyUI-Manager
   - ComfyUI-AnimateDiff
   - ComfyUI-VideoHelperSuite
   - Crystools
   - prompt-assistant

4. **Dependencies** (if missing)
   ```bash
   pip install -r requirements.txt
   pip install opencv-python imageio-ffmpeg av
   ```

## Success Rate
High - Works reliably

## Notes
- RTX 2080 Ti has 22GB VRAM - plenty for most tasks
- Use --listen 0.0.0.0 for remote access
