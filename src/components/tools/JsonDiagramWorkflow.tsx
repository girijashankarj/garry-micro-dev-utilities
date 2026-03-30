import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import mermaid from 'mermaid';
import {
  Background,
  Controls,
  getNodesBounds,
  getOutgoers,
  MarkerType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import type { Edge, Node } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import '@xyflow/react/dist/base.css';
import '@xyflow/react/dist/style.css';

type NodePath = {
  path: string;
  type: string;
};

function getType(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function collectPaths(value: unknown, basePath = '$'): NodePath[] {
  const currentType = getType(value);
  const results: NodePath[] = [{ path: basePath, type: currentType }];

  if (currentType === 'array') {
    (value as unknown[]).forEach((item, index) => {
      results.push(...collectPaths(item, `${basePath}[${index}]`));
    });
    return results;
  }

  if (currentType === 'object') {
    Object.entries(value as Record<string, unknown>).forEach(([key, child]) => {
      results.push(...collectPaths(child, `${basePath}.${key}`));
    });
  }

  return results;
}

function parentPathFor(nodeId: string): string {
  if (nodeId === '$') return '$';
  if (nodeId.includes('[')) {
    return nodeId.replace(/\[[0-9]+\]$/, '') || '$';
  }
  const dot = nodeId.lastIndexOf('.');
  return dot === -1 ? '$' : nodeId.slice(0, dot);
}

function buildFlowElements(mappedNodes: NodePath[], limit = 80): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const limited = mappedNodes.slice(0, limit);
  const seen = new Set<string>();

  limited.forEach((item, index) => {
    const nodeId = item.path;
    if (!seen.has(nodeId)) {
      seen.add(nodeId);
      nodes.push({
        id: nodeId,
        position: { x: (index % 4) * 280, y: Math.floor(index / 4) * 110 },
        data: { label: `${item.path} (${item.type})` },
        style: { fontSize: 12, width: 250 },
      });
    }

    if (nodeId === '$') return;
    const parent = parentPathFor(nodeId);
    if (seen.has(parent)) {
      edges.push({
        id: `${parent}->${nodeId}`,
        source: parent,
        target: nodeId,
        markerEnd: { type: MarkerType.ArrowClosed },
      });
    }
  });

  return { nodes, edges };
}

function buildMermaidSource(mappedNodes: NodePath[], limit = 40): string {
  const lines = ['flowchart TD'];
  const limited = mappedNodes.slice(0, limit);
  const idByPath = new Map<string, string>();

  limited.forEach((item, index) => {
    const id = `n${index}`;
    idByPath.set(item.path, id);
    const label = `${item.path} (${item.type})`.replace(/"/g, "'");
    lines.push(`  ${id}["${label}"]`);
  });

  limited.forEach((item) => {
    if (item.path === '$') return;
    const parent = parentPathFor(item.path);
    const from = idByPath.get(parent);
    const to = idByPath.get(item.path);
    if (from && to) {
      lines.push(`  ${from} --> ${to}`);
    }
  });

  return lines.join('\n');
}

type FlowCanvasProps = {
  initialNodes: Node[];
  initialEdges: Edge[];
};

function FitViewOnChange({ signature }: { signature: string }) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (!signature) return;
    const frame = requestAnimationFrame(() => {
      fitView({ padding: 0.2, duration: 200 });
    });
    return () => cancelAnimationFrame(frame);
  }, [fitView, signature]);

  return null;
}

function FlowStats({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) {
  const stats = useMemo(() => {
    if (nodes.length === 0) return null;
    const root = nodes.find((n) => n.id === '$') ?? nodes[0];
    const outgoing = getOutgoers(root, nodes, edges).length;
    const bounds = getNodesBounds(nodes);
    return { outgoing, width: Math.round(bounds.width), height: Math.round(bounds.height) };
  }, [nodes, edges]);

  if (!stats) return null;

  return (
    <div className="text-xs text-muted-foreground border-t pt-3 mt-3">
      XYFlow utils: root outgoers = {stats.outgoing} · approx bounds {stats.width}×{stats.height}px
    </div>
  );
}

function FlowCanvas({ initialNodes, initialEdges }: FlowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const signature = useMemo(
    () => `${nodes.length}:${edges.length}:${nodes[0]?.id ?? ''}`,
    [nodes, edges]
  );

  return (
    <div className="h-[460px] rounded-md border overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      >
        <MiniMap />
        <Controls />
        <Background />
        <FitViewOnChange signature={signature} />
      </ReactFlow>
      <FlowStats nodes={nodes} edges={edges} />
    </div>
  );
}

export function JsonDiagramWorkflow() {
  const [input, setInput] = useState('');
  const [root, setRoot] = useState<unknown | null>(null);
  const mermaidHostRef = useRef<HTMLDivElement>(null);
  const mermaidDomId = useId().replace(/:/g, '');
  const [viewMode, setViewMode] = useState<'xyflow' | 'mermaid'>('xyflow');

  const mappedNodes = useMemo(() => {
    if (root === null) return [];
    return collectPaths(root);
  }, [root]);

  const { nodes: flowNodes, edges: flowEdges } = useMemo(
    () => buildFlowElements(mappedNodes),
    [mappedNodes]
  );

  const mermaidSource = useMemo(() => {
    if (mappedNodes.length === 0) return '';
    return buildMermaidSource(mappedNodes);
  }, [mappedNodes]);

  const renderMermaid = useCallback(async () => {
    if (!mermaidSource || !mermaidHostRef.current) return;
    try {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
      });
      const { svg } = await mermaid.render(`mm-${mermaidDomId}`, mermaidSource);
      mermaidHostRef.current.innerHTML = svg;
    } catch {
      mermaidHostRef.current.innerHTML =
        '<p class="text-sm text-destructive">Mermaid could not render this graph. Try smaller JSON.</p>';
    }
  }, [mermaidDomId, mermaidSource]);

  useLayoutEffect(() => {
    if (viewMode !== 'mermaid' || !mermaidSource) return;
    void renderMermaid();
  }, [viewMode, mermaidSource, renderMermaid]);

  const handleMap = () => {
    if (!input.trim()) {
      toast.error('Enter JSON first');
      return;
    }

    try {
      const parsed = JSON.parse(input);
      setRoot(parsed);
      toast.success('Diagram generated');
    } catch {
      toast.error('Invalid JSON');
      setRoot(null);
    }
  };

  const handleRefresh = () => {
    setInput('');
    setRoot(null);
    if (mermaidHostRef.current) mermaidHostRef.current.innerHTML = '';
    toast.success('Cleared');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>JavaScript Object Notation (JSON) diagram &amp; workflow</CardTitle>
          <CardDescription>
            Turn any JSON payload into an interactive diagram and a Mermaid flowchart — useful for
            data models, configs, org structures, or workflows across BA, PM, architecture, and
            engineering. State is in-memory only and clears on refresh.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste JSON (object or array) to build the diagram…"
            className="font-mono text-sm min-h-48"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button onClick={handleMap}>Generate diagram</Button>
            <Button variant="outline" onClick={handleRefresh}>
              Clear &amp; reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Diagram &amp; workflow views</CardTitle>
          <CardDescription>
            {mappedNodes.length > 0
              ? `${mappedNodes.length} node(s) in structure`
              : 'No diagram yet. Generate from JSON above.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={viewMode === 'xyflow' ? 'default' : 'outline'}
              onClick={() => setViewMode('xyflow')}
            >
              XYFlow (React Flow)
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'mermaid' ? 'default' : 'outline'}
              onClick={() => setViewMode('mermaid')}
            >
              Mermaid.js
            </Button>
          </div>

          {viewMode === 'xyflow' && flowNodes.length > 0 && (
            <ReactFlowProvider>
              <FlowCanvas initialNodes={flowNodes} initialEdges={flowEdges} />
            </ReactFlowProvider>
          )}

          {viewMode === 'xyflow' && mappedNodes.length > 0 && flowNodes.length === 0 && (
            <p className="text-sm text-muted-foreground">Graph is empty for this payload.</p>
          )}

          {viewMode === 'mermaid' && (
            <div
              ref={mermaidHostRef}
              className="min-h-[320px] rounded-md border p-4 overflow-auto bg-muted/30"
            />
          )}

          {viewMode === 'mermaid' && mappedNodes.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Generate a diagram to see Mermaid output.
            </p>
          )}

          {mappedNodes.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Field paths &amp; types</div>
              <div className="space-y-2 max-h-64 overflow-auto">
                {mappedNodes.map((node) => (
                  <div key={`${node.path}-${node.type}`} className="rounded border p-2 text-sm">
                    <div className="font-mono">{node.path}</div>
                    <div className="text-muted-foreground">type: {node.type}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
