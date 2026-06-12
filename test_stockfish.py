import asyncio
async def test():
    proc = await asyncio.create_subprocess_exec(
        "/home/shiva-reddy/Desktop/Pro/py/stockfish/stockfish-ubuntu-x86-64-avx2",
        stdin=asyncio.subprocess.PIPE,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )
    proc.stdin.write(b"uci\n")
    await proc.stdin.drain()
    while True:
        line = await proc.stdout.readline()
        print(line.decode().strip())
        if b"uciok" in line:
            break
    proc.stdin.write(b"quit\n")
    await proc.stdin.drain()

asyncio.run(test())
