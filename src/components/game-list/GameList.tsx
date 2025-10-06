import {useEffect, useState, Suspense, lazy} from "react";
import {useHttp} from "../../hooks/useHttp.hook";
import type {IGameListElement} from "../../interfaces/game-list-element";
import {ReactSVG} from "react-svg";
import Modal from "../../shared/components/Modal";
import "./GameList.css";

function GameList() {
    const TicTacToe = lazy(() => import('../games/tic-tac-toe/TicTacToe.tsx'));
    const {http, data} = useHttp({isParseJson: true});
    const [gameList, setGameList] = useState<IGameListElement[] | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                await http('../../../data/game-general-info.json');
            } catch (e) {
                console.error(e);
            }
        })();
    }, [http]);

    useEffect(() => {
        if (data) {
            setGameList(data);
        }
    }, [data]);

    const openGame = () => {
        setIsModalOpen(true);
    }

    const template = () => {
        return gameList?.map((el: IGameListElement, i: number) => {
            return (
                <div key={i} onClick={() => openGame()}>
                    <span>{el?.title}</span>
                    <ReactSVG
                        src={'../src/assets/preview/' + el?.image + '.svg'}
                    />
                </div>
            );
        })
    }

    return (
        <div id="game-list-container">
            {gameList?.length ? template() : <div>empty</div>}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            >
                <Suspense>
                    <TicTacToe/>
                </Suspense>
            </Modal>
        </div>
    )
}

export default GameList;
