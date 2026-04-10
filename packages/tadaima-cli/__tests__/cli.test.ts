import { describe, test, expect, beforeAll } from 'vitest';
import { execaCommandSync } from 'execa';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const CLI_PATH = path.resolve(import.meta.dirname, '..', 'dist', 'cli.js');

const createTmpDir = (): string => {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'tadaima-test-'));
};

const run = (args: string[], cwd: string) => {
  return execaCommandSync(`node ${CLI_PATH} ${args.join(' ')}`, { cwd });
};

const withTmpDir = (fn: (tmpDir: string) => void) => {
  const tmpDir = createTmpDir();
  try {
    fn(tmpDir);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
};

beforeAll(() => {
  execaCommandSync('pnpm run build', {
    cwd: path.resolve(import.meta.dirname, '..'),
  });
});

describe('cli', () => {
  test.concurrent('--help shows usage and exits with 0', () => {
    withTmpDir((tmpDir) => {
      const result = run(['--help'], tmpDir);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Usage: create-tadaima');
    });
  });

  test.concurrent('-h shows usage and exits with 0', () => {
    withTmpDir((tmpDir) => {
      const result = run(['-h'], tmpDir);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Usage: create-tadaima');
    });
  });

  test.concurrent('generates arch project with correct files', () => {
    withTmpDir((tmpDir) => {
      run(['test-greeter', '-p', 'arch'], tmpDir);

      const projectDir = path.join(tmpDir, 'test-greeter');
      expect(fs.existsSync(path.join(projectDir, 'package.json'))).toBe(true);
      expect(fs.existsSync(path.join(projectDir, '.gitignore'))).toBe(true);
      expect(fs.existsSync(path.join(projectDir, 'src', 'app.tsx'))).toBe(true);
      expect(fs.existsSync(path.join(projectDir, 'src', 'global.css'))).toBe(true);
      expect(fs.existsSync(path.join(projectDir, 'src', 'components', 'Greeter.tsx'))).toBe(true);
      expect(fs.existsSync(path.join(projectDir, 'src', 'components', 'style.scss'))).toBe(true);
    });
  });

  test.concurrent('generates nixos project with flake.nix and .envrc', () => {
    withTmpDir((tmpDir) => {
      run(['test-greeter', '-p', 'nixos'], tmpDir);

      const projectDir = path.join(tmpDir, 'test-greeter');
      expect(fs.existsSync(path.join(projectDir, 'flake.nix'))).toBe(true);
      expect(fs.existsSync(path.join(projectDir, '.envrc'))).toBe(true);
      expect(fs.existsSync(path.join(projectDir, 'package.json'))).toBe(true);
      expect(fs.existsSync(path.join(projectDir, 'src', 'components', 'Greeter.tsx'))).toBe(true);
    });
  });

  test.concurrent('generates nix project with flake.nix and .envrc', () => {
    withTmpDir((tmpDir) => {
      run(['test-greeter', '-p', 'nix'], tmpDir);

      const projectDir = path.join(tmpDir, 'test-greeter');
      expect(fs.existsSync(path.join(projectDir, 'flake.nix'))).toBe(true);
      expect(fs.existsSync(path.join(projectDir, '.envrc'))).toBe(true);
      expect(fs.existsSync(path.join(projectDir, 'package.json'))).toBe(true);
    });
  });

  test.concurrent('arch project does not include flake.nix or .envrc', () => {
    withTmpDir((tmpDir) => {
      run(['test-greeter', '-p', 'arch'], tmpDir);

      const projectDir = path.join(tmpDir, 'test-greeter');
      expect(fs.existsSync(path.join(projectDir, 'flake.nix'))).toBe(false);
      expect(fs.existsSync(path.join(projectDir, '.envrc'))).toBe(false);
    });
  });

  test.concurrent('replaces {{projectName}} in package.json', () => {
    withTmpDir((tmpDir) => {
      run(['my-greeter', '-p', 'arch'], tmpDir);

      const pkgPath = path.join(tmpDir, 'my-greeter', 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      expect(pkg.name).toBe('my-greeter');
    });
  });

  test.concurrent('replaces {{projectName}} in flake.nix', () => {
    withTmpDir((tmpDir) => {
      run(['my-greeter', '-p', 'nixos'], tmpDir);

      const content = fs.readFileSync(path.join(tmpDir, 'my-greeter', 'flake.nix'), 'utf-8');
      expect(content).toContain('my-greeter');
      expect(content).not.toContain('{{projectName}}');
    });
  });

  test.concurrent('nixos Greeter.tsx uses /run/current-system/sw paths', () => {
    withTmpDir((tmpDir) => {
      run(['test-greeter', '-p', 'nixos'], tmpDir);

      const content = fs.readFileSync(path.join(tmpDir, 'test-greeter', 'src', 'components', 'Greeter.tsx'), 'utf-8');
      expect(content).toContain('/run/current-system/sw/share/wayland-sessions');
    });
  });

  test.concurrent('arch Greeter.tsx uses /usr/share paths', () => {
    withTmpDir((tmpDir) => {
      run(['test-greeter', '-p', 'arch'], tmpDir);

      const content = fs.readFileSync(path.join(tmpDir, 'test-greeter', 'src', 'components', 'Greeter.tsx'), 'utf-8');
      expect(content).toContain('/usr/share/wayland-sessions');
    });
  });

  test.concurrent('nix Greeter.tsx uses /usr/share paths', () => {
    withTmpDir((tmpDir) => {
      run(['test-greeter', '-p', 'nix'], tmpDir);

      const content = fs.readFileSync(path.join(tmpDir, 'test-greeter', 'src', 'components', 'Greeter.tsx'), 'utf-8');
      expect(content).toContain('/usr/share/wayland-sessions');
    });
  });

  test.concurrent('fails when target directory is not empty', () => {
    withTmpDir((tmpDir) => {
      const projectDir = path.join(tmpDir, 'existing');
      fs.mkdirSync(projectDir);
      fs.writeFileSync(path.join(projectDir, 'file.txt'), 'content');

      expect(() => run(['existing', '-p', 'arch'], tmpDir)).toThrow();
    });
  });

  test.concurrent('succeeds when target directory exists but is empty', () => {
    withTmpDir((tmpDir) => {
      const projectDir = path.join(tmpDir, 'empty-dir');
      fs.mkdirSync(projectDir);

      run(['empty-dir', '-p', 'arch'], tmpDir);

      expect(fs.existsSync(path.join(projectDir, 'package.json'))).toBe(true);
    });
  });

  test.concurrent('fails with invalid project name', () => {
    withTmpDir((tmpDir) => {
      expect(() => run(['INVALID!', '-p', 'arch'], tmpDir)).toThrow();
    });
  });

  test.concurrent('fails with invalid platform', () => {
    withTmpDir((tmpDir) => {
      expect(() => run(['test-greeter', '-p', 'windows'], tmpDir)).toThrow();
    });
  });

  test.concurrent('generates into current directory with "."', () => {
    withTmpDir((tmpDir) => {
      run(['.', '-p', 'arch'], tmpDir);

      expect(fs.existsSync(path.join(tmpDir, 'package.json'))).toBe(true);
      expect(fs.existsSync(path.join(tmpDir, 'src', 'app.tsx'))).toBe(true);

      const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf-8'));
      expect(pkg.name).not.toBe('.');
    });
  });
});

