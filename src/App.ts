/*
  
*/
import { dir } from 'console';
import { readFileSync } from 'fs';
import { resolve } from 'path';

type adjacent = {
  cost: number;
  nodeReference: string;
};

class Node {
  public name: string;
  public closed: boolean;
  public dv: number;
  public predecessor: Node;
  public adjacents: adjacent[];

  constructor(name: string, first: boolean = false) {
    this.name = name;
    this.closed = false;
    this.adjacents = [];
    this.dv = first ? 0 : Number.MAX_SAFE_INTEGER;
  }

  public registerAdjacent(name: string, cost: number) {
    const find = this.adjacents.find((el) => el.nodeReference === name);
    if (find) return;
    this.adjacents.push({
      cost,
      nodeReference: name,
    });
  }
}

class App {
  private fileData: string;
  private params: string[];
  private directed: number;
  private graph: Node[];
  private openNodes: Node[];

  constructor() {
    // Carrega o arquivo em uma string
    try {
      this.fileData = readFileSync(resolve(__dirname, 'grafo.txt'), { encoding: 'utf8' });
    } catch {
      console.log('Carga do arquivo falhou! Verifique o nome.');
      return;
    }

    // Carrega os parãmetros em um array
    this.params = this.fileData.split('\n');

    // Carrega a variável de informação de direcionamento
    try {
      this.directed = this.handleDirectedParam();
    } catch {
      console.log('Carga do arquivo falhou! Parâmetro gráfico direcionado, linha 2, inválido.');
      return;
    }

    // inicializa os arrays
    this.graph = [];
    this.openNodes = [];

    // Inicializa o grafo
    try {
      this.init(this.params);
    } catch {
      console.log('Carga do arquivo falhou! Verifique os parâmetros de vertices e arestas.');
      return;
    }
  }

  private handleDirectedParam() {
    const directed = parseInt(this.params[0]);
    if (directed === 1 || directed === 0) {
      return directed;
    }
    throw new Error('Unhandled directed param');
  }

  private handleNodeNames(params: string[]): void {
    const nodeNames = params.slice(2, parseInt(params[1]) + 2);
    console.log('Vertices: ', nodeNames);
    nodeNames.forEach((nodeName) => {
      if (nodeNames[0] === nodeName) this.registerNode(new Node(nodeName, true));
      this.registerNode(new Node(nodeName));
    });
  }

  private registerNode(node: Node) {
    const find: Node = this.graph.find((el) => el.name === node.name);
    if (find) return;
    this.graph.push(node);
  }

  private handleArrests(params: string[]): void {
    const arrests = params.slice(parseInt(params[1]) + 2, params.length);
    console.log('Arestas: ', arrests);
    arrests.forEach((el) => {
      const params = el.split(',');
      this.graph.forEach((node) => {
        if (node.name === params[0]) {
          node.registerAdjacent(params[1], parseInt(params[2]));
        }
      });
    });
  }

  private init(params: string[]) {
    this.handleNodeNames(params);
    this.handleArrests(params);
  }

  private logDijkstraResult(graph: Node[]): void {
    graph.forEach((node) => {
      const predecessor: string = node.predecessor ? node.predecessor.name : null;
      console.log(`Vertice ${node.name}: [${predecessor ? predecessor : '#'} , ${node.dv}]`);
    });
  }

  public dijkstra(): void {
    console.log(this.directed === 1 ? 'Direcionado' : 'Não direcionado');
    try {
      this.openNodes = this.graph;

      while (this.openNodes.length >> 0) {
        const sortedNodes: Node[] = this.openNodes.sort((a: Node, b: Node) =>
          a.dv < b.dv ? -1 : a.dv > b.dv ? 1 : 0,
        );

        const nextOpenNode = sortedNodes[0];

        this.openNodes = this.openNodes.filter((el) => el.name !== nextOpenNode.name);

        nextOpenNode.adjacents.forEach((adjacent) => {
          const node = this.graph.find((node) => node.name === adjacent.nodeReference);

          if (node.closed) return;

          this.graph.forEach((u: Node) => {
            if (u.name === adjacent.nodeReference) {
              const relax = nextOpenNode.dv + adjacent.cost;
              if (relax < u.dv) {
                u.dv = relax;
                node.predecessor = nextOpenNode;
              }
            }
          });
        });
      }

      console.log('Solução encontrada!');
      this.logDijkstraResult(this.graph);
      return;
    } catch {
      console.log('O grafo fornecido está incorreto! Verifique a formatação do arquivo.');
      return;
    }
  }
}

const app = new App();

app.dijkstra();
