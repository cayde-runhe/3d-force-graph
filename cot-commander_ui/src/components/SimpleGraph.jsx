import React, { useEffect, useState } from 'react';
import ForceGraph3D from 'react-force-graph-3d';

export default function SimpleGraph() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  useEffect(() => {
    fetch('/datasets/blocks-aod.json')
      .then(res => res.json())
      .then(data => {
        console.log('blocks-aod.json loaded:', data.nodes.length, 'nodes', data.links.length, 'links');
        setGraphData(data);
      })
      .catch(err => console.error('Failed to load:', err));
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#050510' }}>
      <ForceGraph3D
        graphData={graphData}
        nodeAutoColorBy="user"
        nodeLabel={node => `${node.user}: ${node.description}`}
        onNodeClick={node => console.log('clicked:', node.id, '-', node.description)}
        backgroundColor="#050510"
        showNavInfo={false}
        linkValue="value"
        linkResolution={4}
      />
    </div>
  );
}
